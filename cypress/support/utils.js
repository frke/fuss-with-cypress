export const isMobile = () => {
	return Cypress.config("viewportWidth") < Cypress.env("mobileViewportWidthBreakpoint");
};

// Custom UTC functions per:
// https://github.com/date-fns/date-fns/issues/376#issuecomment-544274031
// not used in application code
/* istanbul ignore next */
export const startOfDayUTC = (date) => new Date(new Date(date).setUTCHours(0, 0, 0, 0));

// not used in application code
/* istanbul ignore next */
export const endOfDayUTC = (date) => new Date(new Date(date).setUTCHours(23, 59, 59, 999));