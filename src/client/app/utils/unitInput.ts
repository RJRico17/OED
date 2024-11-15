// Checks if custom rate is valid by verifying that it is a positive integer.
export const customRateValid = (customRate: number) => {
	return Number.isInteger(customRate) && customRate >= 1;
};
