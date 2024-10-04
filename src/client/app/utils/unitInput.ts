// add comments
export const customRateValid = (customRate: number) => {
	return Number.isInteger(customRate) && customRate >= 1;
};
