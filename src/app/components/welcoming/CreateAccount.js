import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";

import TextField from "@mui/material/TextField";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import CircularProgress from "@mui/material/CircularProgress";

import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import AccountActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import UserActions from "../../actions/UserActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import ImportAccount from "../settings/accounts/ImportAccount";

const styles = {
  nameField: {
    width: "100%",
    marginBottom: "16px",
  },
  cardText: {
    paddingBottom: "32px",
  },
};

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const currencies = useSelector((state) => state.currencies);

  const isLogged = useSelector((state) => state.server.isLogged);
  const [isLocal, setIsLocal] = useState(!isLogged || false);

  const [isImporting, setIsImporting] = useState(false);
  const loading = false;
  const [tabs, setTabs] = useState("create");

  const [error, setError] = useState({});
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    setIsLocal(!isLogged);
  }, [isLogged]);

  useEffect(() => {
    if (props.step == "CREATE_ACCOUNT") {
      setTabs("create");
      setName("");
      setCurrency(null);
      setError({});
      setIsImporting(false);
    }
  }, [props.step]);

  const handleSaveChange = (event) => {
    event.preventDefault();
    dispatch(
      AccountActions.create({
        name: name,
        currency: currency.id,
        isLocal: isLocal,
      })
    )
      .then((account) => {
        dispatch(AccountActions.switchAccount(account));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const logout = () => {
    dispatch(UserActions.logout(true)).then(() => {
      props.setStep("SELECT_MODE");
    });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2 style={{ marginBottom: 4 }}>New account</h2>
        <Tabs
          centered
          variant="fullWidth"
          value={tabs}
          textColor='inherit'
          onChange={(event, value) => setTabs(value)}
        >
          <Tab label="Create" value="create" disabled={isImporting} />
          <Tab label="Import" value="import" disabled={isImporting} />
        </Tabs>
      </header>
      <div className="content">
        {tabs === "create" && (
          <div className="layout_content">
            <form
              style={styles.cardText}
              onSubmit={(event) => handleSaveChange(event)}
            >
              <TextField
                label="Name"
                value={name}
                style={styles.nameField}
                error={Boolean(error.name)}
                helperText={error.name}
                onChange={(event) => setName(event.target.value)}
                autoFocus={true}
                margin="normal"
                variant="standard"
              />
              <br />
              <div className="selectCurrency">
                <AutoCompleteSelectField
                  value={currency}
                  values={currencies}
                  error={Boolean(error.currency)}
                  helperText={error.currency}
                  onChange={(currency) => setCurrency(currency || null)}
                  label="Currency"
                  maxHeight={400}
                  fullWidth={true}
                  style={{ textAlign: "left" }}
                />
              </div>
              <br />
              {isLogged && (
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(isLocal || !isLogged)}
                        disabled={Boolean(!isLogged)}
                        onChange={() => setIsLocal(!isLocal)}
                        value="isLocal"
                        color="primary"
                      />
                    }
                    label="Only save on device"
                  />
                </FormGroup>
              )}
            </form>
          </div>
        )}

        {tabs === "import" && (
          <div style={styles.container}>
            <ImportAccount onImport={() => setIsImporting(true)} />
          </div>
        )}
      </div>
      <footer className="spaceBetween">
        {isLogged ? (
          <Button onClick={() => logout()}>Logout</Button>
        ) : (
          <Button onClick={() => props.setStep("SELECT_MODE")}>Cancel</Button>
        )}
        <Button
          variant="contained"
          color="primary"
          disabled={!name || !currency}
          onClick={handleSaveChange}
        >
          Create new account
        </Button>
      </footer>
    </div>
  );
}