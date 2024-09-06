import * as React from 'react';
import { Input } from 'reactstrap';
import { useAppDispatch, useAppSelector } from '../redux/reduxHooks';
import { selectQueryTimeInterval, selectShiftAmount, selectShiftTimeInterval, updateShiftAmount, updateShiftTimeInterval } from '../redux/slices/graphSlice';
import translate from '../utils/translate';
import { FormattedMessage } from 'react-intl';
import { ShiftAmount } from '../types/redux/graph';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { dateRangeToTimeInterval, timeIntervalToDateRange } from '../utils/dateRangeCompatibility';
import { selectSelectedLanguage } from '../redux/slices/appStateSlice';
import { Value } from '@wojtekmaj/react-daterange-picker/dist/cjs/shared/types';
import * as moment from 'moment';
import { TimeInterval } from '../../../common/TimeInterval';

/**
 * @returns compare line control page
 */
export default function CompareLineControlsComponent() {
	const dispatch = useAppDispatch();
	const shiftAmount = useAppSelector(selectShiftAmount);
	const timeInterval = useAppSelector(selectQueryTimeInterval);
	const locale = useAppSelector(selectSelectedLanguage);
	const shiftInterval = useAppSelector(selectShiftTimeInterval);

	// Hold value of shifting option (week, month, year, or custom)
	const [shiftOption, setShiftOption] = React.useState<ShiftAmount>(shiftAmount);
	// Hold value to track whether custom data range picker should show up or not
	const [showDatePicker, setShowDatePicker] = React.useState(false);
	const shiftAmountNotSelected = shiftAmount === ShiftAmount.none;

	// Update shifting option when shift data interval is chosen
	const handleShiftOptionChange = (value: string) => {
		if (value === 'custom') {
			setShiftOption(ShiftAmount.custom);
			dispatch(updateShiftAmount(ShiftAmount.custom));
			setShowDatePicker(true);
		} else {
			setShowDatePicker(false);
			if (value === 'none') {
				setShiftOption(ShiftAmount.none);
				dispatch(updateShiftAmount(ShiftAmount.none));
				updateShiftInterval(ShiftAmount.none);
			} else if (value === 'week') {
				setShiftOption(ShiftAmount.week);
				dispatch(updateShiftAmount(ShiftAmount.week));
				updateShiftInterval(ShiftAmount.week);
			} else if (value === 'month') {
				setShiftOption(ShiftAmount.month);
				dispatch(updateShiftAmount(ShiftAmount.month));
				updateShiftInterval(ShiftAmount.month);
			} else if (value === 'year') {
				setShiftOption(ShiftAmount.year);
				dispatch(updateShiftAmount(ShiftAmount.year));
				updateShiftInterval(ShiftAmount.year);
			}
		}
	};

	// update shift data date range when shift date interval option is chosen
	const updateShiftInterval = (shiftOption: ShiftAmount) => {
		const startDate = timeInterval.getStartTimestamp();
		const endDate = timeInterval.getEndTimestamp();
		if (startDate !== null || endDate !== null) {
			const { shiftedStart, shiftedEnd } = shiftDateFunc(startDate, endDate, shiftOption);
			const newInterval = new TimeInterval(shiftedStart, shiftedEnd);
			dispatch(updateShiftTimeInterval(newInterval));
		}
	}

	// Update date when the data range picker is used in custome shifting option
	const handleShiftDateChange = (value: Value) => {
		dispatch(updateShiftTimeInterval(dateRangeToTimeInterval(value)));
	}

	return (
		<>
			<div key='side-options'>
				<p style={labelStyle}>
					<FormattedMessage id='shift.date.interval' />
					{/* <TooltipMarkerComponent helpTextId='help.shift.date.interval' /> // TODO: Add later */}
				</p>
				<Input
					id='shiftDateInput'
					name='shiftDateInput'
					type='select'
					value={shiftOption}
					invalid={shiftAmountNotSelected}
					onChange={e => handleShiftOptionChange(e.target.value)}
				>
					<option value="none" hidden disabled>{translate('select.shift.amount')}</option>
					<option value="week">{translate('1.week')}</option>
					<option value="month">{translate('1.month')}</option>
					<option value="year">{translate('1.year')}</option>
					<option value="custom">{translate('custom.date.range')}</option>
				</Input>
				{showDatePicker &&
					<DateRangePicker
						value={timeIntervalToDateRange(shiftInterval)}
						onChange={handleShiftDateChange}
						calendarProps={{ defaultView: 'year' }}
						minDate={new Date(1970, 0, 1)}
						maxDate={new Date()}
						locale={locale} // Formats Dates, and Calendar months base on locale
						calendarIcon={null}
					/>}

			</div>
		</>
	);

}

const labelStyle: React.CSSProperties = { fontWeight: 'bold', margin: 0 };

/**
 * shifting date function to find the shifted start date and shifted end date
 * @param originalStart  start date of current graph data
 * @param endoriginalEndDate end date of current graph data
 * @param shiftType shifting amount in week, month, or year
 * @returns shifted start and shifted end dates for the new data
 */
function shiftDateFunc(originalStart: moment.Moment, originalEnd: moment.Moment, shiftType: ShiftAmount) {
	let shiftedStart: moment.Moment;
	let shiftedEnd: moment.Moment;

	const originalRangeDays = originalEnd.diff(originalStart, 'days');

	switch (shiftType) {
		case 'none':
			shiftedStart = originalStart.clone();
			shiftedEnd = originalEnd.clone();
			break;

		case 'week':
			shiftedStart = originalStart.clone().subtract(7, 'days');
			shiftedEnd = originalEnd.clone().subtract(7, 'days');
			break;

		case 'month':
			shiftedStart = originalStart.clone().subtract(1, 'months');
			shiftedEnd = shiftedStart.clone().add(originalRangeDays, 'days');

			if (shiftedEnd.isSameOrAfter(originalStart)) {
				shiftedEnd = originalStart.clone().subtract(1, 'day');
			} else if (originalStart.date() === 1 && originalEnd.date() === originalEnd.daysInMonth()) {
				if (!(shiftedStart.date() === 1 && shiftedEnd.date() === shiftedEnd.daysInMonth())) {
					shiftedEnd = shiftedStart.clone().endOf('month');
				}
			}
			break;

		case 'year':
			shiftedStart = originalStart.clone().subtract(1, 'years');
			shiftedEnd = originalEnd.clone().subtract(1, 'years');

			if (originalStart.isLeapYear() && originalStart.month() === 1 && originalStart.date() === 29) {
				shiftedStart = shiftedStart.month(2).date(1);
			}
			if (originalEnd.isLeapYear() && originalEnd.month() === 1 && originalEnd.date() === 29) {
				shiftedEnd = shiftedEnd.month(1).date(28);
			}
			if (shiftedEnd.isSameOrAfter(originalStart)) {
				shiftedEnd = originalStart.clone().subtract(1, 'day');
			}
			break;

		default:
			shiftedStart = originalStart.clone();
			shiftedEnd = originalEnd.clone();
	}

	return { shiftedStart, shiftedEnd };
}
