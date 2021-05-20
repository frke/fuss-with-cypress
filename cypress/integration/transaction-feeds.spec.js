import {addDays, startOfDay} from "date-fns";
import {endOfDayUTC, isMobile} from "../support/utils";

const users = require('../fixtures/users.json');

const {_} = Cypress;

describe("Transaction Feed", function () {

	const ctx = {};

	const username = users[0].username

	const feedViews = {
		public: {
			tab: "public-tab",
			tabLabel: "everyone",
			routeAlias: "publicTransactions",
			service: "publicTransactionService",
		},
		contacts: {
			tab: "contacts-tab",
			tabLabel: "friends",
			routeAlias: "contactsTransactions",
			service: "contactTransactionService",
		},
		personal: {
			tab: "personal-tab",
			tabLabel: "mine",
			routeAlias: "personalTransactions",
			service: "personalTransactionService",
		},
	};

	beforeEach(function () {

		cy.intercept("GET", "/notifications").as("notifications");
		cy.intercept("GET", "/transactions*").as(feedViews.personal.routeAlias);
		cy.intercept("GET", "/transactions/public*").as(feedViews.public.routeAlias);
		cy.intercept("GET", "/transactions/contacts*").as(feedViews.contacts.routeAlias);

		cy.loginByXstate(username);
	});
	describe("app layout and responsiveness", function () {
		it("toggles the navigation drawer", function () {
			cy.wait("@notifications");
			cy.wait("@publicTransactions");
			if (isMobile()) {
				cy.getDtLike("sidenav-home").should("not.exist");
				cy.getDtLike("sidenav-toggle").click();
				cy.getDtLike("sidenav-home").should("be.visible");
				cy.get(".MuiBackdrop-root").click({force: true});
				cy.getDtLike("sidenav-home").should("not.exist");

				cy.getDtLike("sidenav-toggle").click();
				cy.getDtLike("sidenav-home").click().should("not.exist");
			} else {
				cy.getDtLike("sidenav-home").should("be.visible");
				cy.getDtLike("sidenav-toggle").click();
				cy.getDtLike("sidenav-home").should("not.be.visible");
			}
		});
	});

	describe("renders and paginates all transaction feeds", function () {
		it("renders transactions item variations in feed", function () {
			cy.intercept("GET", "/transactions/public*", {
				headers: {
					"X-Powered-By": "Express",
					Date: new Date().toString(),
				},
				fixture: "public-transactions.json",
			}).as("mockedPublicTransactions");

			// Visit page again to trigger call to /transactions/public
			cy.visit("/");

			cy.wait("@notifications");
			cy.wait("@mockedPublicTransactions")
				.its("response.body.results")
				.then((transactions) => {
					const getTransactionFromEl = ($el) => {
						const transactionId = $el.data("test").split("transaction-item-")[1];
						return _.find(transactions, (transaction) => {
							return transaction.id === transactionId;
						});
					};

					cy.log("🚩Testing a paid payment transaction item");
					cy.contains("[data-test*='transaction-item']", "paid").within(($el) => {
						const transaction = getTransactionFromEl($el);
						const formattedAmount = Dinero({
							amount: transaction.amount,
						}).toFormat();

						expect([TransactionStatus.pending, TransactionStatus.complete]).to.include(
							transaction.status
						);

						expect(transaction.requestStatus).to.be.empty;

						cy.getDtLike("like-count").should("have.text", `${transaction.likes.length}`);
						cy.getDtLike("comment-count").should("have.text", `${transaction.comments.length}`);

						cy.getDtLike("sender").should("contain", transaction.senderName);
						cy.getDtLike("receiver").should("contain", transaction.receiverName);

						cy.getDtLike("amount")
							.should("contain", `-${formattedAmount}`)
							.should("have.css", "color", "rgb(255,0,0)");
					});

					cy.log("🚩Testing a charged payment transaction item");
					cy.contains("[data-test*='transaction-item']", "charged").within(($el) => {
						const transaction = getTransactionFromEl($el);
						const formattedAmount = Dinero({
							amount: transaction.amount,
						}).toFormat();

						expect(TransactionStatus.complete).to.equal(transaction.status);

						expect(transaction.requestStatus).to.equal(TransactionRequestStatus.accepted);

						cy.getDtLike("amount")
							.should("contain", `+${formattedAmount}`)
							.should("have.css", "color", "rgb(76, 175, 80)");
					});

					cy.log("🚩Testing a requested payment transaction item");
					cy.contains("[data-test*='transaction-item']", "requested").within(($el) => {
						const transaction = getTransactionFromEl($el);
						const formattedAmount = Dinero({
							amount: transaction.amount,
						}).toFormat();

						expect([TransactionStatus.pending, TransactionStatus.complete]).to.include(
							transaction.status
						);
						expect([
							TransactionRequestStatus.pending,
							TransactionRequestStatus.rejected,
						]).to.include(transaction.requestStatus);

						cy.getDtLike("amount")
							.should("contain", `+${formattedAmount}`)
							.should("have.css", "color", "rgb(76, 175, 80)");
					});
				});
		});

		_.each(feedViews, (feed, feedName) => {
			it(`paginates ${feedName} transaction feed`, function () {
				cy.getDtLike(feed.tab)
					.click()
					.should("have.class", "Mui-selected")
					.contains(feed.tabLabel, {matchCase: false})
					.should("have.css", {"text-transform": "uppercase"});
				cy.getDtLike("list-skeleton").should("not.exist");

				cy.wait(`@${feed.routeAlias}`)
					.its("response.body.results")
					.should("have.length", Cypress.env("paginationPageSize"));

				// Temporary fix: https://github.com/cypress-io/cypress-realworld-app/issues/338
				if (isMobile()) {
					cy.wait(10);
				}

				cy.log("📃 Scroll to next page");
				cy.getDtLike("transaction-list").children().scrollTo("bottom");

				cy.wait(`@${feed.routeAlias}`)
					.its("response.body")
					.then(({results, pageData}) => {
						expect(results).have.length(Cypress.env("paginationPageSize"));
						expect(pageData.page).to.equal(2);
						cy.nextTransactionFeedPage(feed.service, pageData.totalPages);
					});

				cy.wait(`@${feed.routeAlias}`)
					.its("response.body")
					.then(({results, pageData}) => {
						expect(results).to.have.length.least(1);
						expect(pageData.page).to.equal(pageData.totalPages);
						expect(pageData.hasNextPages).to.equal(false);
					});
			});
		});
	});

	describe.only("filters transaction feeds by date range", function () {
		if (isMobile()) {
			it("closes date range picker modal", () => {
				cy.getDtLike("filter-date-range-button").click({force: true});
				cy.get(".Cal__Header__root").should("be.visible");
				cy.getDtLike("date-range-filter-drawer-close").click();
				cy.get(".Cal__Header__root").should("not.exist");
			});
		}

		_.each(feedViews, (feed, feedName) => {

			it(`does not show ${feedName} transactions for out of range date limits`, function () {
				const dateRangeStart = startOfDay(new Date(2014, 1, 1));
				const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

				cy.getDtLike(feed.tab).click();
				cy.wait(`@${feed.routeAlias}`);

				cy.pickDateRange(dateRangeStart, dateRangeEnd);
				cy.wait(`@${feed.routeAlias}`);

				cy.getDtLike("transaction-item").should("have.length", 0);
				cy.getDtLike("empty-list-header").should("contain", "No Transactions");
				cy.getDtLike("empty-create-transaction-button")
					.should("have.attr", "href", "/transaction/new")
					.contains("create a transaction", {matchCase: false})
					.should("have.css", {"text-transform": "uppercase"});
			});
		});
	});

	describe("filters transaction feeds by amount range", function () {
		const dollarAmountRange = {
			min: 200,
			max: 800,
		};

		_.each(feedViews, (feed, feedName) => {
			it(`filters ${feedName} transaction feed by amount range`, function () {
				cy.getDtLike(feed.tab).click({force: true}).should("have.class", "Mui-selected");

				cy.wait(`@${feed.routeAlias}`).its("response.body.results").as("unfilteredResults");

				cy.setTransactionAmountRange(dollarAmountRange.min, dollarAmountRange.max);

				cy.getDtLike("filter-amount-range-text").should(
					"contain",
					`$${dollarAmountRange.min} - $${dollarAmountRange.max}`
				);

				// @ts-ignore
				cy.wait(`@${feed.routeAlias}`).then(({response: {body, url}}) => {
					const transactions = body.results;
					const urlParams = new URLSearchParams(_.last(url.split("?")));

					const rawAmountMin = dollarAmountRange.min * 100;
					const rawAmountMax = dollarAmountRange.max * 100;

					expect(urlParams.get("amountMin")).to.equal(`${rawAmountMin}`);
					expect(urlParams.get("amountMax")).to.equal(`${rawAmountMax}`);

					transactions.forEach(({amount}) => {
						expect(amount).to.be.within(rawAmountMin, rawAmountMax);
					});
				});

				cy.getDtLike("amount-clear-button").click();
				cy.get("@unfilteredResults").then((unfilteredResults) => {
					cy.wait(`@${feed.routeAlias}`)
						.its("response.body.results")
						.should("deep.equal", unfilteredResults);
				});

				if (isMobile()) {
					cy.getDtLike("amount-range-filter-drawer-close").click();
					cy.getDtLike("amount-range-filter-drawer").should("not.exist");
				} else {
					cy.getDtLike("transaction-list-filter-amount-clear-button").click();
					cy.getDtLike("main").scrollTo("top");
					cy.getDtLike("transaction-list-filter-date-range-button").click({force: true});
					cy.getDtLike("transaction-list-filter-amount-range").should("not.be.visible");
				}
			});

			it(`does not show ${feedName} transactions for out of range amount limits`, function () {
				cy.getDtLike(feed.tab).click();
				cy.wait(`@${feed.routeAlias}`);

				cy.setTransactionAmountRange(550, 1000);
				cy.getDtLike("filter-amount-range-text").should("contain", "$550 - $1,000");
				cy.wait(`@${feed.routeAlias}`);

				cy.getDtLike("transaction-item").should("have.length", 0);
				cy.getDtLike("empty-list-header").should("contain", "No Transactions");
				cy.getDtLike("empty-create-transaction-button")
					.should("have.attr", "href", "/transaction/new")
					.contains("create a transaction", {matchCase: false})
					.should("have.css", {"text-transform": "uppercase"});
			});
		});
	});

	describe("Feed Item Visibility", () => {
		it("mine feed only shows personal transactions", function () {
			cy.fixture("contacts", {userId: users[0].id}).then((contacts) => {
				ctx.contactIds = contacts.map((contact) => contact.contactUserId);
			});

			cy.getDtLike(feedViews.personal.tab).click();

			cy.wait("@personalTransactions")
				.its("response.body.results")
				.each((transaction) => {
					const transactionParticipants = [transaction.senderId, transaction.receiverId];
					expect(transactionParticipants).to.include(users[0].id);
				});
		});

		it("first five items belong to contacts in public feed", function () {
			cy.database("filter", "contacts", {userId: users[0].id}).then((contacts) => {
				ctx.contactIds = contacts.map((contact) => contact.contactUserId);
			});

			cy.wait("@publicTransactions")
				.its("response.body.results")
				.invoke("slice", 0, 5)
				.each((transaction) => {
					const transactionParticipants = [transaction.senderId, transaction.receiverId];

					const contactsInTransaction = _.intersection(transactionParticipants, ctx.contactIds);
					const message = `"${contactsInTransaction}" are contacts of ${users[0].id}`;
					expect(contactsInTransaction, message).to.not.be.empty;
				});
		});

		it("friends feed only shows contact transactions", function () {
			cy.database("filter", "contacts", {userId: users[0].id}).then((contacts) => {
				ctx.contactIds = contacts.map((contact) => contact.contactUserId);
			});

			cy.getDtLike(feedViews.contacts.tab).click();

			cy.wait("@contactsTransactions")
				.its("response.body.results")
				.each((transaction) => {
					const transactionParticipants = [transaction.senderId, transaction.receiverId];

					const contactsInTransaction = _.intersection(ctx.contactIds, transactionParticipants);

					const message = `"${contactsInTransaction}" are contacts of ${users[0].id}`;
					expect(contactsInTransaction, message).to.not.be.empty;
				});
			cy.getDtLike("list-skeleton").should("not.exist");
		});
	});
});
