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

import faker from "faker";

Cypress.Commands.add("getDtLike", (selector, ...args) => {
	return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add("loginByXstate", (username, password = 's3cret') => {
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

Cypress.Commands.add('createBankAccount', (bankName = "Bank", accountNumber = faker.finance.account(10), routingNumber = faker.finance.account(9)) => {
	const apiGqlURL = `${Cypress.env('apiUrl')}/graphql`
	cy.request("POST", apiGqlURL, {
		query: `mutation createBankAccount ($bankName: String!, $accountNumber: String!,  $routingNumber: String!) {
          createBankAccount(
            bankName: $bankName,
            accountNumber: $accountNumber,
            routingNumber: $routingNumber
          ) {
            id
            uuid
            userId
            bankName
            accountNumber
            routingNumber
            isDeleted
            createdAt
          }
        }`,
		variables: {
			bankName: ` ${bankName} - ${faker.company.companyName()}`,
			accountNumber: accountNumber,
			routingNumber: routingNumber,
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
})

Cypress.Commands.add('createNotifications', () => {
	cy.request("POST", `${Cypress.env('apiUrl')}/notifications/bulk`, {
		items: [
			{
				type: "payment",
				transactionId: "-jCJOEkLh0J",
				status: "received",
			},
			{
				type: "like",
				transactionId: '-jCJOEkLh0J',
				likeId: "MC54o2D5r9aU",
			},
			{
				type: "comment",
				transactionId: "tsHF6_D5oQ",
				commentId: "K3HLpKcGKDiP",
			},
		],
	}).then((response) => {
		expect(response.status).to.eq(200);
		expect(response.body.results.length).to.equal(3);
	});

})

// Stub graphql response
Cypress.Commands.add('stubGQL', (operationName, response, alias = 'stub', options = {
	headers: {
		'access-control-allow-origin': '*',
	},
}) => {
	cy.intercept(
		{
			method: 'POST',
		},
		(request) => {
			const data = response.data;
			if (request.body.hasOwnProperty("query") && request.body.query.includes(operationName)) {
				request.reply({
					...options,
					body: {
						data
					},
				})
			}
		},
	).as(alias)
})