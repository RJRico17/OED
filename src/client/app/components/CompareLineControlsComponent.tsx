/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Input } from 'reactstrap';
import { useAppDispatch, useAppSelector } from '../redux/reduxHooks';
import {
	selectQueryTimeInterval, selectShiftAmount, selectShiftTimeInterval, updateShiftAmount, updateShiftTimeInterval
} from '../redux/slices/graphSlice';
import translate from '../utils/translate';
import { FormattedMessage } from 'react-intl';
import { ShiftAmount } from '../types/redux/graph';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { dateRangeToTimeInterval, timeIntervalToDateRange } from '../utils/dateRangeCompatibility';
import { selectSelectedLanguage } from '../redux/slices/appStateSlice';
import { Value } from '@wojtekmaj/react-daterange-picker/dist/cjs/shared/types';
import * as moment from 'moment';
import { TimeInterval } from '../../../common/TimeInterval';
// import { showWarnNotification } from '../utils/notifications';

/**
 * @returns compare line control component for compare line graph page
 */
export default function CompareLineControlsComponent() {
	const dispatch = useAppDispatch();
	const shiftAmount = useAppSelector(selectShiftAmount);
	const timeInterval = useAppSelector(selectQueryTimeInterval);
	const locale = useAppSelector(selectSelectedLanguage);
	const shiftInterval = useAppSelector(selectShiftTimeInterval);

	// Hold value of shifting option (week, month, year, or custom)
	const [shiftOption, setShiftOption] = React.useState<ShiftAmount>(shiftAmount);
	// Hold value to store the custom date range for the shift interval
	const [customDateRange, setCustomDateRange] = React.useState<TimeInterval>(shiftInterval);

	// Add this useEffect to update the shift interval when the shift option changes
	React.useEffect(() => {
		if (shiftOption !== ShiftAmount.custom) {
			updateShiftInterval(shiftOption);
		}
	}, [shiftOption, timeInterval]);

	// Update custom date range value when shift interval changes
	React.useEffect(() => {
		setCustomDateRange(shiftInterval);
	}, [shiftInterval]);

	// Handle changes in shift option (week, month, year, or custom)
	const handleShiftOptionChange = (value: string) => {
		if (value === 'custom') {
			setShiftOption(ShiftAmount.custom);
			dispatch(updateShiftAmount(ShiftAmount.custom));
		} else {
			const newShiftOption = value as ShiftAmount;
			setShiftOption(newShiftOption);
			dispatch(updateShiftAmount(newShiftOption));
			updateShiftInterval(newShiftOption);
		}
	};

	// Update shift data date range when shift date interval option is chosen
	const updateShiftInterval = (shiftOption: ShiftAmount) => {
		const startDate = timeInterval.getStartTimestamp();
		const endDate = timeInterval.getEndTimestamp();
		if (startDate !== null || endDate !== null) {
			const { shiftedStart, shiftedEnd } = shiftDate(startDate, endDate, shiftOption);
			const newInterval = new TimeInterval(shiftedStart, shiftedEnd);
			dispatch(updateShiftTimeInterval(newInterval));
		}
	};

	// Update date when the data range picker is used in custome shifting option
	const handleShiftDateChange = (value: Value) => {
		setCustomDateRange(dateRangeToTimeInterval(value));
		dispatch(updateShiftTimeInterval(dateRangeToTimeInterval(value)));
	};

	return (
		<>
			<div key='side-options'>
				<p style={{ fontWeight: 'bold', margin: 0 }}>
					<FormattedMessage id='shift.date.interval' />
					{/* <TooltipMarkerComponent helpTextId='help.shift.date.interval' /> // TODO: Add later */}
				</p>
				<Input
					id='shiftDateInput'
					name='shiftDateInput'
					type='select'
					value={shiftOption}
					invalid={shiftAmount === ShiftAmount.none}
					onChange={e => handleShiftOptionChange(e.target.value)}
				>
					<option value="none" hidden disabled>{translate('select.shift.amount')}</option>
					<option value="week">{translate('1.week')}</option>
					<option value="month">{translate('1.month')}</option>
					<option value="year">{translate('1.year')}</option>
					<option value="custom">{translate('custom.date.range')}</option>
				</Input>
				{/* Show date picker when custom date range is selected */}
				{shiftOption === ShiftAmount.custom &&
					<DateRangePicker
						value={timeIntervalToDateRange(customDateRange)}
						onChange={handleShiftDateChange}
						minDate={new Date(1970, 0, 1)}
						maxDate={new Date()}
						locale={locale} // Formats Dates, and Calendar months base on locale
						calendarIcon={null}
						calendarProps={{ defaultView: 'year' }}
					/>}

			</div>
		</>
	);

}

/**
 * Shifting date function to find the shifted start date and shifted end date for shift amount that is not custom
 * @param originalStart  start date of current graph data
 * @param originalEnd end date of current graph data
 * @param shiftType shifting amount in week, month, or year
 * @returns shifted start and shifted end dates for the new data
 */
export function shiftDate(originalStart: moment.Moment, originalEnd: moment.Moment, shiftType: ShiftAmount) {
	let shiftedStart = originalStart.clone();

	if (shiftType === ShiftAmount.none) {
		shiftedStart = originalStart.clone();
	} else if (shiftType === ShiftAmount.week) {
		shiftedStart = originalStart.clone().subtract(7, 'days');
	} else if (shiftType === ShiftAmount.month) {
		shiftedStart = originalStart.clone().subtract(1, 'months');
	} else if (shiftType === ShiftAmount.year) {
		shiftedStart = originalStart.clone().subtract(1, 'years');
	}

	// Add the number of days in the original line to the shifted start to get the end.
	// This means the original and shifted lines have the same number of days.
	// Let moment decide the day since it may help with leap years, etc.
	const originalDateRange = originalEnd.diff(originalStart, 'days');
	const shiftedEnd = shiftedStart.clone().add(originalDateRange, 'days');

	return { shiftedStart, shiftedEnd };
}

// /**
//  * shifting date function to find the shifted start date and shifted end date
//  * @param originalStart  start date of current graph data
//  * @param originalEnd end date of current graph data
//  * @param shiftType shifting amount in week, month, or year
//  * @returns shifted start and shifted end dates for the new data
//  */
// export function shiftDate(originalStart: moment.Moment, originalEnd: moment.Moment, shiftType: ShiftAmount) {
// 	let shiftedStart: moment.Moment;
// 	let shiftedEnd: moment.Moment;

// 	const originalRangeDays = originalEnd.diff(originalStart, 'days');

// 	switch (shiftType) {
// 		case 'none':
// 			shiftedStart = originalStart.clone();
// 			shiftedEnd = originalEnd.clone();
// 			break;

// 		case 'week':
// 			shiftedStart = originalStart.clone().subtract(7, 'days');
// 			shiftedEnd = originalEnd.clone().subtract(7, 'days');
// 			break;

// 		case 'month':
// 			shiftedStart = originalStart.clone().subtract(1, 'months');
// 			shiftedEnd = shiftedStart.clone().add(originalRangeDays, 'days');

// 			if (shiftedEnd.isSameOrAfter(originalStart)) {
// 				shiftedEnd = originalStart.clone().subtract(1, 'day');
// 			} else if (originalStart.date() === 1 && originalEnd.date() === originalEnd.daysInMonth()) {
// 				if (!(shiftedStart.date() === 1 && shiftedEnd.date() === shiftedEnd.daysInMonth())) {
// 					shiftedEnd = shiftedStart.clone().endOf('month');
// 				}
// 			}
// 			break;

// 		case 'year':
// 			shiftedStart = originalStart.clone().subtract(1, 'years');
// 			shiftedEnd = originalEnd.clone().subtract(1, 'years');

// 			if (originalStart.isLeapYear() && originalStart.month() === 1 && originalStart.date() === 29) {
// 				shiftedStart = shiftedStart.month(2).date(1);
// 			}
// 			if (originalEnd.isLeapYear() && originalEnd.month() === 1 && originalEnd.date() === 29) {
// 				shiftedEnd = shiftedEnd.month(1).date(28);
// 			}
// 			if (shiftedEnd.isSameOrAfter(originalStart)) {
// 				shiftedEnd = originalStart.clone().subtract(1, 'day');
// 			}
// 			break;

// 		default:
// 			shiftedStart = originalStart.clone();
// 			shiftedEnd = originalEnd.clone();
// 	}

// 	return { shiftedStart, shiftedEnd };
// }

// /**
//  * This function check whether the original date range is leap year or the shifted date range is leap year.
//  * If it is true, it warns user about shifting to (or from) a leap year to non leap year.
//  * @param startDate original data start date
//  * @param endDate original data end date
//  * @param shiftOption shifting option
//  */
// function checkLeapYear(startDate: moment.Moment, endDate: moment.Moment, shiftOption: ShiftAmount) {
// 	const { shiftedStart, shiftedEnd } = shiftDate(startDate, endDate, shiftOption);
// 	const originalIsLeapYear = startDate.isLeapYear() || endDate.isLeapYear();
// 	const shiftedIsLeapYear = shiftedStart.isLeapYear() || shiftedEnd.isLeapYear();

// 	// Check if the original date range crosses Feb 29, which causes unaligned graph
// 	const originalCrossFeb29 = (
// 		startDate.isLeapYear() &&
// 		startDate.isBefore(moment(`${startDate.year()}-03-01`)) &&
// 		endDate.isAfter(moment(`${startDate.year()}-02-28`))
// 	);

// 	// Check if the shifted date range crosses Feb 29, which causes unaligned graph
// 	const shiftedCrossFeb29 = (
// 		shiftedStart.isLeapYear() &&
// 		shiftedStart.isBefore(moment(`${shiftedStart.year()}-03-01`)) &&
// 		shiftedEnd.isAfter(moment(`${shiftedStart.year()}-02-28`))
// 	);

// 	if (originalCrossFeb29 && !shiftedIsLeapYear) {
// 		showWarnNotification(translate('original.data.crosses.leap.year.to.non.leap.year'));
// 	} else if (shiftedCrossFeb29 && !originalIsLeapYear) {
// 		showWarnNotification(translate('shifted.data.crosses.leap.year.to.non.leap.year'));
// 	}
// }