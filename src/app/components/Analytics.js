import './Analytics.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Close from '@material-ui/icons/Close';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Chip from '@material-ui/core/Chip';

import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';

import MonthLineGraph from './charts/MonthLineGraph';
import PieGraph from './charts/PieGraph';

import StatisticsActions from '../actions/StatisticsActions';

import { Amount } from './currency/Amount';

import UserButton from './settings/UserButton';
import DateFieldWithButtons from './forms/DateFieldWithButtons';

const styles = theme => ({
  chips: {
    margin: '0px 8px 4px 0px',
  }
});

// Todo: replace localStorage item Report with redux
class Analytics extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stats: null,
      isLoading: true,
      graph: null,
      trend: null,
      currentYear: null,
      menu: 'LAST_12_MONTHS',
      dateStr: '',
      open: true,
      dateBegin: moment
        .utc()
        .subtract(12, 'month')
        .startOf('month'),
      dateEnd: moment
        .utc()
        .subtract(1, 'month')
        .endOf('month'),
    };
    this.history = props.history;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleGraphClick = date => {
    this.history.push(
      '/transactions/' +
        date.getFullYear() +
        '/' +
        (+date.getMonth() + 1) +
        '/',
    );
  };

  handleDateChange = (dateBegin = this.state.dateBegin, dateEnd = this.state.dateEnd) => {
    this.setState({
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      open: false,
      isLoading: true,
    });
    this._processData(dateBegin.toDate(), dateEnd.toDate());
  };

  _handleChangeMenu = (value, fetchData = true) => {
    this.setState({
      menu: value,
    });

    let dateBegin = null;
    let dateEnd = null;
    let dateStr = '';

    switch (value) {
    case 'LAST_12_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(12, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 12 months';
      break;
    case 'LAST_6_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(6, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 6 months';
      break;
    case 'LAST_3_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(3, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 3 months';
      break;
    case 'NEXT_YEAR':
      dateBegin = moment
        .utc()
        .add(1, 'year')
        .startOf('year');
      dateEnd = moment
        .utc()
        .add(1, 'year')
        .endOf('year');
      dateStr = moment().utc().add(1, 'year').format('YYYY');
      break;
    case 'CURRENT_YEAR':
      dateBegin = moment.utc().startOf('year');
      dateEnd = moment.utc().endOf('year');
      dateStr = moment().utc().format('YYYY');
      break;
    case 'LAST_YEAR':
      dateBegin = moment
        .utc()
        .subtract(1, 'year')
        .startOf('year');
      dateEnd = moment
        .utc()
        .subtract(1, 'year')
        .endOf('year');
      dateStr = moment().utc().subtract(1, 'year').format('YYYY');
      break;
    case 'LAST_2_YEAR':
      dateBegin = moment
        .utc()
        .subtract(1, 'year')
        .startOf('year');
      dateEnd = moment.utc().endOf('year');
      dateStr = `${moment().utc().subtract(1, 'year').format('YYYY')} - ${moment().utc().format('YYYY')}`;
      break;
    }

    this.setState({
      isLoading: true,
      stats: null,
      currentYear: null,
      trend: null,
      graph: null,
      perCategories: null,
      dateStr,
      dateBegin,
      dateEnd,
    });

    this._processData(dateBegin.toDate(), dateEnd.toDate());
  };

  _processData = (begin = this.state.dateBegin.toDate(), end = this.state.dateEnd.toDate()) => {
    const { dispatch, categories } = this.props;

    dispatch(StatisticsActions.report(begin, end)).then((result) => {

      // Generate Graph data
      let lineExpenses = {
        color: 'red',
        values: [],
      };

      let lineIncomes = {
        values: [],
      };

      Object.keys(result.stats.perDates).forEach(year => {
        // For each month of year
        Object.keys(result.stats.perDates[year].months).forEach(month => {
          if (result.stats.perDates[year].months[month]) {
            lineExpenses.values.push({
              date: new Date(year, month),
              value: +result.stats.perDates[year].months[month].expenses * -1,
            });
            lineIncomes.values.push({
              date: new Date(year, month),
              value: result.stats.perDates[year].months[month].incomes,
            });
          } else {
            lineExpenses.values.push({ date: new Date(year, month), value: 0 });
            lineIncomes.values.push({ date: new Date(year, month), value: 0 });
          }
        });
      });

      this.setState({
        isLoading: false,
        currentYear: result.currentYear,
        trend: result.trend,
        stats: result.stats,
        graph: [lineIncomes, lineExpenses],
        perCategories: Object.keys(result.stats.perCategories)
          .map(id => {
            return {
              id: id,
              name: categories.find(category => {
                return '' + category.id === '' + id;
              }).name,
              incomes: result.stats.perCategories[id].incomes,
              expenses: result.stats.perCategories[id].expenses,
            };
          })
          .sort((a, b) => {
            return a.expenses > b.expenses ? 1 : -1;
          }),
      });

    }).catch((error) => {
      console.error(error);
    });
  };

  componentDidMount() {
    this._handleChangeMenu(this.state.menu);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isSyncing != nextProps.isSyncing && nextProps.isSyncing === false) {
      this._handleChangeMenu(this.state.menu);
    }
  }

  render() {
    const { theme, selectedCurrency, categories, isSyncing, classes, youngest, oldest } = this.props;
    const { anchorEl, open, isLoading, dateBegin, dateEnd } = this.state;

    const list_of_years = [];
    for (var i = moment(youngest).year(); i <= moment(oldest).year(); i++) {
      list_of_years.push(i);
    }

    return (
      <div className="layout">
        <header className="layout_header">
          <div className="layout_header_top_bar">
            <h2>Analytics</h2>
            <div className='showMobile'><UserButton history={this.history} type="button" color="white" /></div>
          </div>
          <div className="layout_header_date_range">

            <DateFieldWithButtons
              label="From"
              disabled={isLoading || isSyncing}
              value={dateBegin}
              onChange={date => this.handleDateChange(date, null)}
              disableYestedayButton="true"
              format="MMM Do, YY"
              fullWidth
              autoOk={true}
            />
            <DateFieldWithButtons
              label="To"
              disabled={isLoading || isSyncing}
              value={dateEnd}
              onChange={date => this.handleDateChange(null, date)}
              disableYestedayButton="true"
              format="MMM Do, YY"
              fullWidth
              autoOk={true}
            />
            <IconButton
              onClick={(event) => this.setState({ open: !open })}>
              { open ? <Close color="action" /> : <ExpandMore color="action" />}
            </IconButton>
          </div>
        </header>
        <div className='layout_content noscroll'>

          <div className={(open ? 'open' : '') + ' suggestions'}>
            <h4>Past months</h4>
            <p>
              <Chip clickable
                className={classes.chips}
                label="Past 3 months"
                onClick={() => {
                  const dateBegin = moment
                    .utc()
                    .subtract(3, 'month')
                    .startOf('month');
                  const dateEnd = moment
                    .utc()
                    .subtract(1, 'month')
                    .endOf('month');
                  this.handleDateChange(dateBegin, dateEnd);
                }}
              />
              <Chip clickable
                className={classes.chips}
                label="Past 6 months"
                onClick={() => {
                  const dateBegin = moment
                    .utc()
                    .subtract(6, 'month')
                    .startOf('month');
                  const dateEnd = moment
                    .utc()
                    .subtract(1, 'month')
                    .endOf('month');
                  this.handleDateChange(dateBegin, dateEnd);
                }}
              />
              <Chip clickable
                className={classes.chips}
                label="Past 12 months"
                onClick={() => {
                  const dateBegin = moment
                    .utc()
                    .subtract(12, 'month')
                    .startOf('month');
                  const dateEnd = moment
                    .utc()
                    .subtract(1, 'month')
                    .endOf('month');
                  this.handleDateChange(dateBegin, dateEnd);
                }}
              />
              <Chip clickable
                className={classes.chips}
                label="Past 24 months"
                onClick={() => {
                  const dateBegin = moment
                    .utc()
                    .subtract(24, 'month')
                    .startOf('month');
                  const dateEnd = moment
                    .utc()
                    .subtract(1, 'month')
                    .endOf('month');
                  this.handleDateChange(dateBegin, dateEnd);
                }}
              />
            </p>
            <h4>Per year</h4>
            <p>
              { list_of_years.map(year => {
                  return (
                    <Chip clickable
                      className={classes.chips}
                      key={year}
                      label={year}
                      onClick={() => {
                        const dateBegin = moment(`${year}`)
                          .utc()
                          .startOf('year');
                        const dateEnd = moment(`${year}`)
                          .utc()
                          .endOf('year');
                        this.handleDateChange(dateBegin, dateEnd);
                      }}
                    />
                  );
                })
              }
            </p>

            <h4>Others</h4>
            <p>
              <Chip clickable
                className={classes.chips}
                label="All transactions"
                onClick={() => {
                  this.handleDateChange(moment(youngest), moment(oldest));
                }}
              />
            </p>
          </div>
          <div className="report">
            <div
              style={{
                fontSize: '0.9rem',
                padding: '20px 20px 20px',
              }}
            >
              <p>
                Total <strong>income</strong> of{' '}
                <span style={{ color: green[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.incomes} currency={selectedCurrency} />
                  )}
                </span>{' '}
                for a total of{' '}
                <span style={{ color: red[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses} currency={selectedCurrency} />
                  )}
                </span>{' '}
                in <strong>expenses</strong>, leaving a <strong>balance</strong>{' '}
                of{' '}
                <span style={{ color: blue[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses + this.state.stats.incomes} currency={selectedCurrency} />
                  )}
                </span>.
              </p>
              <p>
                For this period of{' '}
                <span style={{ color: blue[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w20" />
                  ) : (
                    this.state.dateEnd.diff(this.state.dateBegin, 'month') + 1
                  )}
                </span>{' '}
                months, <strong>average monthly income</strong> is{' '}
                <span style={{ color: green[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.incomes /
                      (this.state.dateEnd.diff( this.state.dateBegin, 'month', ) + 1)}
                    currency={selectedCurrency} />
                  )}
                </span>{' '}
                and <strong>average monthly expense</strong> is{' '}
                <span style={{ color: red[500] }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses /
                      (this.state.dateEnd.diff( this.state.dateBegin, 'month', ) + 1)}
                    currency={selectedCurrency} />
                  )}
                </span>.
              </p>
            </div>
            <div>
              <MonthLineGraph
                values={this.state.graph || []}
                onClick={this.handleGraphClick}
                ratio="50%"
                isLoading={isLoading || isSyncing}
                color={theme.palette.text.primary}
              />
            </div>
            <div className="camembert">
              <div className="item" style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                  }}
                >
                  <PieGraph
                    values={this.state.perCategories || []}
                    isLoading={isLoading || isSyncing}
                  />
                </div>
              </div>
              <div className="item">
                <Table style={{ background: 'none' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell align="right">
                        Expenses
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.perCategories && !isSyncing
                      ? this.state.perCategories.map(item => {
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              {
                                categories.find(category => {
                                  return '' + category.id === '' + item.id;
                                }).name
                              }
                            </TableCell>
                            <TableCell align="right">
                              <Amount value={item.expenses} currency={selectedCurrency} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                      : [
                        'w120',
                        'w80',
                        'w120',
                        'w120',
                        'w120',
                        'w80',
                        'w120',
                        'w120',
                      ].map((value, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <span className={`loading ${value}`} />
                            </TableCell>
                            <TableCell>
                              <span className="loading w30" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Analytics.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    youngest: state.account.youngest,
    oldest: state.account.oldest,
    categories: state.categories.list,
    user: state.user,
    isSyncing: state.state.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Analytics)));