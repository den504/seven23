import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "../../router";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import ActionCheckCircle from "@material-ui/icons/CheckCircle";

const styles = {
  actions: {
    textAlign: "right"
  },
  urlField: {
    width: "100%",
    marginBottom: "16px"
  },
  loading: {
    margin: "8px 20px 0px 20px"
  },
  icon: {
    width: "40px",
    height: "40px",
    marginRight: 12,
    marginTop: -5,
    marginLeft: 20,
    verticalAlign: "middle"
  }
};

export default function ForgottenPasswordForm(props) {
  const [email, setEmail] = useState("");
  const { history } = useRouter();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    if (props.step == "FORGOTTEN_PASSWORD") {
      setEmail("");
      setDone(false);
      setError({});
    }
  }, [props.step]);

  const handleSaveChange = event => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);
    setError({});

    axios({
      url: "/api/v1/rest-auth/password/reset/",
      method: "post",
      data: {
        email: email,
        origin: window.location.href.split(history.location.pathname)[0]
      }
    })
      .then(response => {
        setLoading(false);
        setDone(true);
      })
      .catch(function(ex) {
        setLoading(false);
        setError({
          email: "An error occured and prevented the email to be send."
        });
      });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2>Forgotten password</h2>
      </header>
      <div className="content">
        <p>
          We can send an email with a temporary link to reset your password.
        </p>
        <div>
          {done ? (
            <div>
              <p>
                <ActionCheckCircle style={styles.icon} /> An email has been
                send.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveChange}>
              <TextField
                label="Email address"
                value={email}
                style={styles.urlField}
                disabled={loading}
                error={Boolean(error.email)}
                helperText={error.email}
                onChange={event => setEmail(event.target.value)}
                autoFocus={true}
                margin="normal"
                fullWidth
              />
            </form>
          )}
        </div>
      </div>
      <footer className="spaceBetween">
        <Button onClick={() => props.setStep("CONNECT")}>Cancel</Button>
        <Button onClick={() => handleSaveChange()} disabled={!email}>
          Send email
        </Button>
      </footer>
    </div>
  );
}

// class ForgottenPasswordForm extends Component {
//   constructor(props, context) {
//     super(props, context);
//     this.history = props.history;
//     this.state = {
//       loading: false,
//       email: "",
//       done: false,
//       error: {}
//     };
//   }

//   handleSaveChange = e => {
//     e.preventDefault();

//     this.setState({
//       loading: true,
//       error: {}
//     });

//     let that = this;

//     axios({
//       url: "/api/v1/rest-auth/password/reset/",
//       method: "post",
//       data: {
//         email: this.state.email,
//         origin: window.location.href.split(this.history.location.pathname)[0]
//       }
//     })
//       .then(response => {
//         that.setState({
//           loading: false,
//           done: true
//         });
//       })
//       .catch(function(ex) {
//         that.setState({
//           loading: false,
//           error: {
//             email: "An error occured and prevented the email to be send."
//           }
//         });
//       });
//   };

//   handleChangeEmail = event => {
//     this.setState({ email: event.target.value });
//   };

//   render() {
//     return (
//       <form onSubmit={this.handleSaveChange}>
//         <h2 style={{ fontSize: "2.1em" }}>Forgotten password</h2>
//         <p>
//           We can send an email with a temporary link to reset your password.
//         </p>
//         <div>
//           {this.state.done ? (
//             <div>
//               <p>
//                 <ActionCheckCircle style={styles.icon} /> An email has been
//                 send.
//               </p>
//             </div>
//           ) : (
//             <TextField
//               label="Email address"
//               value={this.state.email}
//               style={styles.urlField}
//               disabled={this.state.loading}
//               error={Boolean(this.state.error.email)}
//               helperText={this.state.error.email}
//               onChange={this.handleChangeEmail}
//               autoFocus={true}
//               margin="normal"
//               fullWidth
//             />
//           )}
//         </div>
//         <div style={styles.actions}>
//           {this.state.done ? (
//             <div>
//               <Link to="/login">
//                 <Button>Close</Button>
//               </Link>
//             </div>
//           ) : (
//             <div>
//               {this.state.loading ? (
//                 <CircularProgress size={20} style={styles.loading} />
//               ) : (
//                 <div>
//                   <Link to="/login">
//                     <Button>Cancel</Button>
//                   </Link>
//                   <Button type="submit">Send request</Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </form>
//     );
//   }
// }

// export default ForgottenPasswordForm;
