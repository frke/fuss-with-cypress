// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("getDtLike", (selector, ...args) => {
	return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add("loginByXstate", (username, password = Cypress.env("defaultPassword")) => {
	const log = Cypress.log({
		name: "loginbyxstate",
		displayName: "LOGIN BY XSTATE",
		message: [`🔐 Authenticating | ${username}`],
		autoEnd: false,
	});

	cy.intercept("POST", "/login").as("loginUser");
	cy.intercept("GET", "/checkAuth").as("getUserProfile");
	cy.visit("/signin", {log: false}).then(() => {
		log.snapshot("before");
	});

	cy.window({log: false}).then((win) => win.authService.send("LOGIN", {username, password}));

	return cy.wait("@loginUser").then((loginUser) => {
		log.set({
			consoleProps() {
				return {
					username,
					password,
					// @ts-ignore
					userId: loginUser.response.body.user.id,
				};
			},
		});

		log.snapshot("after");
		log.end();
	});
});