import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from './serviceWorker'

import App from "./App";

window.process = {
	env: {
		NODE_ENV: 'development'
	}
};

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		if (window.finishProgress) {
			window.finishProgress();
		}
	}
);

serviceworker.register()