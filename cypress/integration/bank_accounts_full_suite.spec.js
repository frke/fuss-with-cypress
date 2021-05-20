/// <reference types="cypress" />

import {isMobile} from "../support/utils";

const users = require('../fixtures/users.json');
const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

describe("Bank Accounts", function () {

	const username = users[0].username

	beforeEach(function () {

		cy.intercept("GET", "/notifications").as("getNotifications");

		cy.intercept("POST", apiGraphQL, (req) => {
			const {body} = req;
			if (body.hasOwnProperty("query") && body.query.includes("listBankAccount")) {
				req.alias = "gqlListBankAccountQuery";
			}

			if (body.hasOwnProperty("query") && body.query.includes("createBankAccount")) {
				req.alias = "gqlCreateBankAccountMutation";
			}

			if (body.hasOwnProperty("query") && body.query.includes("deleteBankAccount")) {
				req.alias = "gqlDeleteBankAccountMutation";
			}
		});

		cy.loginByXstate(username);
	});

	it("Creates a new bank account", function () {
		cy.wait("@getNotifications");

		if (isMobile()) {
			cy.getDtLike("sidenav-toggle").click();
		}

		cy.getDtLike("sidenav-bankaccounts").click();

		cy.getDtLike("bankaccount-new").click({force: true});
		cy.location("pathname").should("eq", "/bankaccounts/new");

		cy.getDtLike("bankName-input").type("The Best Bank");
		cy.getDtLike("routingNumber-input").type("987654321");
		cy.getDtLike("accountNumber-input").type("123456789");

		cy.getDtLike("submit").click();

		cy.wait("@gqlCreateBankAccountMutation");

		cy.getDtLike("bankaccount-list-item")
			.should("have.length.greaterThan", 2)
			.contains('li', 'Best B')
			.and("contain", "The Best Bank")
			.find('button')
			.should('contain.text', 'Delete', {force: true})
			.and('not.contain.text', 'shebang', {force: true});
	});

	it("Should display bank account form errors", function () {
		cy.visit("/bankaccounts");
		cy.getDtLike("bankaccount-new").click();

		cy.getDtLike("bankName-input").type("The").find("input").clear().blur();
		cy.get("#bankaccount-bankName-input-helper-text")
			.should("be.visible")
			.and("contain", "Enter a bank name");

		cy.getDtLike("bankName-input").type("The").find("input").blur();
		cy.get("#bankaccount-bankName-input-helper-text")
			.should("be.visible")
			.and("contain", "Must contain at least 5 characters");

		/** Routing number input validations **/
		// Required field
		cy.getDtLike("routingNumber-input").find("input").focus().blur();
		cy.get(`#bankaccount-routingNumber-input-helper-text`)
			.should("be.visible")
			.and("contain", "Enter a valid bank routing number");

		// Min 9 digit
		cy.getDtLike("routingNumber-input").type("12345678").find("input").blur();
		cy.get("#bankaccount-routingNumber-input-helper-text")
			.should("be.visible")
			.and("contain", "Must contain a valid routing number");
		cy.getDtLike("routingNumber-input").find("input").clear();

		cy.getDtLike("routingNumber-input").type("123456789").find("input").blur();
		cy.get("#bankaccount-routingNumber-input-helper-text").should("not.exist");

		/** Account number input validations **/
		// Required field
		cy.getDtLike("accountNumber-input").find("input").focus().blur();
		cy.get(`#bankaccount-accountNumber-input-helper-text`)
			.should("be.visible")
			.and("contain", "Enter a valid bank account number");

		// Min 9 digit
		cy.getDtLike("accountNumber-input").type("12345678").find("input").blur();
		cy.get("#bankaccount-accountNumber-input-helper-text")
			.should("be.visible")
			.and("contain", "Must contain at least 9 digits");
		cy.getDtLike("accountNumber-input").find("input").clear();

		cy.getDtLike("accountNumber-input").type("123456789").find("input").blur();
		cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
		cy.getDtLike("accountNumber-input").find("input").clear();

		// Max 12 gdigit
		cy.getDtLike("accountNumber-input").type("123456789111").find("input").blur();
		cy.get("#bankaccount-accountNumber-input-helper-text").should("not.exist");
		cy.getDtLike("accountNumber-input").find("input").clear();

		cy.getDtLike("accountNumber-input").type("1234567891111").find("input").blur();
		cy.get("#bankaccount-accountNumber-input-helper-text")
			.should("be.visible")
			.and("contain", "Must contain no more than 12 digits");

		cy.getDtLike("bankaccount-submit").should("be.disabled");
	});

	it("Soft deletes a bank account", function () {
		cy.visit("/bankaccounts");
		cy.getDtLike("delete").first().click({force: true});

		cy.wait("@gqlDeleteBankAccountMutation");
		cy.getDtLike("list-item").children().contains("Deleted");
	});

	it("Renders an empty bank account list state with onboarding modal", function () {
		cy.intercept("POST", apiGraphQL, (req) => {
			const {body} = req;
			if (body.hasOwnProperty("query") && body.query.includes("listBankAccount")) {
				req.alias = "gqlListBankAccountQuery";
				req.continue((res) => {
					res.body.data.listBankAccount = [];
				});
			}
		});

		cy.visit("/bankaccounts");
		cy.wait("@gqlListBankAccountQuery");

		cy.getDtLike("bankaccount-list").should("not.exist");
		cy.getDtLike("empty-list-header").should("contain", "No Bank Accounts");
		cy.getDtLike("user-onboarding-dialog").should("be.visible");
		cy.getDtLike("nav-top-notifications-count").should("exist");
	});
});
