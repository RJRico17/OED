/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debounce } from 'lodash';
import { utc } from 'moment';
import * as moment from 'moment';
import * as React from 'react';
import Plot from 'react-plotly.js';
import { TimeInterval } from '../../../common/TimeInterval';
import { updateSliderRange } from '../redux/actions/extraActions';
import { readingsApi, stableEmptyLineReadings } from '../redux/api/readingsApi';
import { useAppDispatch, useAppSelector } from '../redux/reduxHooks';
import { selectCompareLineQueryArgs } from '../redux/selectors/chartQuerySelectors';
import { selectLineUnitLabel } from '../redux/selectors/plotlyDataSelectors';
import { selectSelectedLanguage } from '../redux/slices/appStateSlice';
import Locales from '../types/locales';
import translate from '../utils/translate';
import SpinnerComponent from './SpinnerComponent';
import { selectGraphState, selectShiftAmount, selectShiftTimeInterval, updateShiftTimeInterval } from '../redux/slices/graphSlice';
import ThreeDPillComponent from './ThreeDPillComponent';
import { selectThreeDComponentInfo } from '../redux/selectors/threeDSelectors';
import { selectPlotlyGroupData, selectPlotlyMeterData } from '../redux/selectors/lineChartSelectors';
import { MeterOrGroup, ShiftAmount } from '../types/redux/graph';
import { shiftDate } from './CompareLineControlsComponent';
import { showInfoNotification, showWarnNotification } from '../utils/notifications';
import { PlotRelayoutEvent } from 'plotly.js';

/**
 * @returns plotlyLine graphic
 */
export default function CompareLineChartComponent() {
	const dispatch = useAppDispatch();
	const graphState = useAppSelector(selectGraphState);
	const meterOrGroupID = useAppSelector(selectThreeDComponentInfo).meterOrGroupID;
	const unitLabel = useAppSelector(selectLineUnitLabel);
	const locale = useAppSelector(selectSelectedLanguage);
	const shiftInterval = useAppSelector(selectShiftTimeInterval);
	const shiftAmount = useAppSelector(selectShiftAmount);
	const { args, shouldSkipQuery, argsDeps } = useAppSelector(selectCompareLineQueryArgs);

	// getting the time interval of current data
	const timeInterval = graphState.queryTimeInterval;

	// Storing the time interval strings for the original data and the shifted data to use for range in plot
	const [timeIntervalStr, setTimeIntervalStr] = React.useState(TimeInterval.unbounded());
	const [shiftIntervalStr, setShiftIntervalStr] = React.useState(TimeInterval.unbounded());

	// Fetch original data, and derive plotly points
	const { data, isFetching } = graphState.threeD.meterOrGroup === MeterOrGroup.meters ?
		readingsApi.useLineQuery(args,
			{
				skip: shouldSkipQuery,
				selectFromResult: ({ data, ...rest }) => ({
					...rest,
					data: selectPlotlyMeterData(data ?? stableEmptyLineReadings,
						{ ...argsDeps, compatibleEntities: [meterOrGroupID!] })
				})
			})
		:
		readingsApi.useLineQuery(args,
			{
				skip: shouldSkipQuery,
				selectFromResult: ({ data, ...rest }) => ({
					...rest,
					data: selectPlotlyGroupData(data ?? stableEmptyLineReadings,
						{ ...argsDeps, compatibleEntities: [meterOrGroupID!] })
				})
			});

	// Update shifted interval based on current interval and shift amount
	React.useEffect(() => {
		const startDate = timeInterval.getStartTimestamp();
		const endDate = timeInterval.getEndTimestamp();

		if (startDate && endDate) {
			setTimeIntervalStr(timeInterval);
			if (shiftAmount !== ShiftAmount.none && shiftAmount !== ShiftAmount.custom) {
				const { shiftedStart, shiftedEnd } = shiftDate(startDate, endDate, shiftAmount);
				dispatch(updateShiftTimeInterval(new TimeInterval(shiftedStart, shiftedEnd)));
			}
		}
	}, [timeInterval, shiftAmount]);

	// Update shift interval string based on shift interval or time interval
	React.useEffect(() => {
		if (shiftInterval.getIsBounded()) {
			setShiftIntervalStr(shiftInterval);
		} else {
			// If shift interval is not set, use the original time interval
			if (timeInterval.getIsBounded()) {
				setShiftIntervalStr(timeInterval);
			}
		}
	}, [shiftInterval, timeInterval]);

	// Getting the shifted data
	const { data: dataNew, isFetching: isFetchingNew } = graphState.threeD.meterOrGroup === MeterOrGroup.meters ?
		readingsApi.useLineQuery({ ...args, timeInterval: shiftInterval.toString() },
			{
				skip: shouldSkipQuery,
				selectFromResult: ({ data, ...rest }) => ({
					...rest,
					data: selectPlotlyMeterData(data ?? stableEmptyLineReadings,
						{ ...argsDeps, compatibleEntities: [meterOrGroupID!] })
				})
			})
		:
		readingsApi.useLineQuery({ ...args, timeInterval: shiftInterval.toString() },
			{
				skip: shouldSkipQuery,
				selectFromResult: ({ data, ...rest }) => ({
					...rest,
					data: selectPlotlyGroupData(data ?? stableEmptyLineReadings,
						{ ...argsDeps, compatibleEntities: [meterOrGroupID!] })
				})
			});

	if (isFetching || isFetchingNew) {
		return <SpinnerComponent loading height={50} width={50} />;
	}

	// Check if there is at least one valid graph for current data and shifted data
	const enoughData = data.find(data => data.x!.length > 1) && dataNew.find(dataNew => dataNew.x!.length > 1);

	// Customize the layout of the plot
	// See https://community.plotly.com/t/replacing-an-empty-graph-with-a-message/31497 for showing text `not plot.
	if (!meterOrGroupID) {
		return <><ThreeDPillComponent /><h1>{`${translate('select.meter.group')}`}</h1></>;
	} else if (!timeInterval.getIsBounded()) {
		return <><ThreeDPillComponent /><h1>{`${translate('please.set.the.date.range')}`}</h1></>;
	} else if (!enoughData) {
		return <><ThreeDPillComponent /><h1>{`${translate('no.data.in.range')}`}</h1></>;
	} else {
		// Checks/warnings on received reading data
		if (timeInterval.getIsBounded() && shiftInterval.getIsBounded()) {
			checkReceivedData(data[0].x, dataNew[0].x);
		}

		// Adding information to the shifted data so that it can be plotted on the same graph with current data
		const updateDataNew = dataNew.map(item => ({
			...item,
			name: 'Shifted ' + item.name,
			line: { ...item.line, color: '#1AA5F0' },
			xaxis: 'x2',
			text: Array.isArray(item.text)
				? item.text.map(text => text.replace('<br>', '<br>Shifted '))
				: item.text?.replace('<br>', '<br>Shifted ')
		}));

		return (
			<>
				<ThreeDPillComponent />
				<Plot
					// Only plot shifted data if the shiftAmount has been chosen
					data={shiftAmount === ShiftAmount.none ? [...data] : [...data, ...updateDataNew]}
					style={{ width: '100%', height: '100%', minHeight: '700px' }}
					layout={{
						autosize: true, showlegend: true,
						legend: { x: 0, y: 1.1, orientation: 'h' },
						// 'fixedrange' on the yAxis means that dragging is only allowed on the xAxis which we utilize for selecting dateRanges
						yaxis: { title: unitLabel, gridcolor: '#ddd', fixedrange: true },
						xaxis: {
							// Set range for x-axis based on timeIntervalStr so that current data and shifted data is aligned
							range: timeIntervalStr.getIsBounded()
								? [timeIntervalStr.getStartTimestamp(), timeIntervalStr.getEndTimestamp()]
								: undefined
						},
						xaxis2: {
							titlefont: { color: '#1AA5F0' },
							tickfont: { color: '#1AA5F0' },
							overlaying: 'x',
							side: 'top',
							// Set range for x-axis2 based on shiftIntervalStr so that current data and shifted data is aligned
							range: shiftIntervalStr.getIsBounded()
								? [shiftIntervalStr.getStartTimestamp(), shiftIntervalStr.getEndTimestamp()]
								: undefined
						}
					}}
					config={{
						responsive: true,
						displayModeBar: false,
						// Current Locale
						locale,
						// Available Locales
						locales: Locales
					}}
					onRelayout={debounce(
						(e: PlotRelayoutEvent) => {
							// This event emits an object that contains values indicating changes in the user's graph, such as zooming.
							if (e['xaxis.range[0]'] && e['xaxis.range[1]']) {
								// The event signals changes in the user's interaction with the graph.
								// this will automatically trigger a refetch due to updating a query arg.
								const startTS = utc(e['xaxis.range[0]']);
								const endTS = utc(e['xaxis.range[1]']);
								const workingTimeInterval = new TimeInterval(startTS, endTS);
								dispatch(updateSliderRange(workingTimeInterval));
							}
							else if (e['xaxis.range']) {
								// this case is when the slider knobs are dragged.
								const range = e['xaxis.range']!;
								const startTS = range && range[0];
								const endTS = range && range[1];
								dispatch(updateSliderRange(new TimeInterval(utc(startTS), utc(endTS))));
							}
						}, 500, { leading: false, trailing: true })
					}
				/>
			</>

		);

	}
}

/**
 * If the number of points differs for the original and shifted lines, the data will not appear at the same places horizontally.
 * The time interval in the original and shifted line for the actual readings can have issues.
 * While the requested time ranges should be the same, the actually returned readings may differ.
 * This can happen if there are readings missing including start, end or between. If the number of readings vary then there is an issue.
 * If not, it is unlikely but can happen if there are missing readings in both lines that do not align but there are the same number missing in both.
 * This is an ugly edge case that OED is not going to try to catch now.
 * Use the last index in Redux state as a proxy for the number since need that below.
 * @param originalReading original data to compare
 * @param shiftedReading shifted data to compare
 */
function checkReceivedData(originalReading: any, shiftedReading: any) {
	let numberPointsSame = true;
	if (originalReading.length !== shiftedReading.length) {
		// If the number of points vary then then scales will not line up point by point. Warn the user.
		numberPointsSame = false;
		showWarnNotification(`The original line has ${originalReading.length} readings but the shifted line has ${shiftedReading.length}`
			+ ' readings which means the points will not align horizontally.');
	}
	// Now see if the original and shifted lines overlap.
	if (moment(shiftedReading.at(-1).toString()) > moment(originalReading.at(0).toString())) {
		showInfoNotification(`The shifted line overlaps the original line starting at ${originalReading[0]}`);
	}
	// Now see if day of the week aligns.
	// If the number of points is not the same then no horizontal alignment so do not tell user.
	if (numberPointsSame && moment(originalReading.at(0)?.toString()).day() === moment(shiftedReading.at(0)?.toString()).day()) {
		showInfoNotification('days of week align (unless missing readings)');
	}
	// Now see if the month and day align. If the number of points is not the same then no horizontal
	// alignment so do not tell user. Check if the first reading matches because only notify if this is true.
	if (numberPointsSame && monthDateSame(moment(originalReading.at(0)?.toString()), moment(shiftedReading.at(0)?.toString()))) {
		// Loop over all readings but the first. Really okay to do first but just checked that one.
		// Note length of original and shifted same so just use original.
		let message = 'The month and day of the month align for the original and shifted readings';
		for (let i = 1; i < originalReading.length; i++) {
			if (!monthDateSame(moment(originalReading.at(i)?.toString()), moment(shiftedReading.at(i)?.toString()))) {
				// Mismatch so inform user. Should be due to leap year crossing and differing leap year.
				// Only tell first mistmatch
				message += ` until original reading at date ${moment(originalReading.at(i)?.toString()).format('ll')}`;
			}
		}
		showInfoNotification(message);
	}
}

/**
 * Check if the two dates have the same date and month
 * @param firstDate first date to compare
 * @param secondDate second date to compare
 * @returns true if the month and date are the same
 */
function monthDateSame(firstDate: moment.Moment, secondDate: moment.Moment) {
	// The month (0 up numbering) and date (day of month with 1 up numbering) must match.
	// The time could be checked but the granulatity should be the same for original and
	// shifted readings and only mismatch if there is missing readings. In the unlikely
	// event of having the same number of points but different missing readings then
	// the first one will mismatch the month or day unless those happen to match in which
	// case it is still true that they are generally okay so ignore all this.
	return firstDate.month() === secondDate.month() && firstDate.date() === secondDate.date();
}