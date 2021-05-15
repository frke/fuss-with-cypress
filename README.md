# **What’s The Fuss With Cypress.io?** 

[![Cypress.io tests](https://img.shields.io/badge/cypress.io-tests-green.svg?style=flat-square)](https://cypress.io)

[![Installing Cypress](https://blog.davidjeddy.com/wp-content/uploads/2018/07/cypress_header.png)](https://docs.cypress.io/)

---
---

**1.** Cd to your workspace

> _$_ `cd <your workspace path>`

**2.** Clone ***fuss-with-cypress*** project

> _$_ `git clone https://github.com/milanranisavljevic/fuss-with-cypress.git`

**3.** Run

> _$_ `npm install`

**4.** Set `<project root>\node_modules\.bin` as environment variable

**5.** After successful installation of modules, to open _**Cypress Test Runner**_ for _default_  environment

> _$_ `cypress open`

---
---

> #### **⚠ NOTE:**
> To open _**Cypress Test Runner**_ for different environment _**e.g.**_ `config/stage.json`<br>
>
>_$_ `cypress open --env configFile=stage`

---
---

## **Reporting**

Generate a combined HTML report from the `mochawesome.json`

_$_ `npx generate-mochawesome-report`

---
---

## **References**

- [API](https://docs.cypress.io/api/api/table-of-contents.html)

- [Kitchin Sink](https://example.cypress.io/commands/querying)

- [Cypress.IO Examples ](https://docs.cypress.io/examples/examples/recipes.html#Fundamentals)

- [Page Object Cypress](https://medium.com/reactbrasil/deep-diving-pageobject-pattern-and-using-it-with-cypress-e60b9d7d0d91)

- [Stop using Page Objects and Start using App Actions](https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions/)

- [Introducing the Cypress Real World App](https://www.cypress.io/blog/2020/06/11/introducing-the-cypress-real-world-app/#header)
