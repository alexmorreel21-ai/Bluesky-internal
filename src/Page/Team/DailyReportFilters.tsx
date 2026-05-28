import DatePicker from 'react-datepicker'
import type { DailyReportTeamOption } from '../../api/dailyReports'

export type ReportView = 'day' | 'week' | 'month'

type DailyReportFiltersProps = {
  reportView: ReportView
  onReportViewChange: (value: ReportView) => void
  selectedDate: Date
  onSelectedDateChange: (value: Date) => void
  selectedWeekDate: Date
  onSelectedWeekDateChange: (value: Date) => void
  selectedMonthDate: Date
  onSelectedMonthDateChange: (value: Date) => void
  isCalendarOpen: boolean
  onCalendarOpenChange: (value: boolean) => void
  selectedTeamFilter: string
  onSelectedTeamFilterChange: (value: string) => void
  teamFilterOptions: string[]
  teamOptions: DailyReportTeamOption[]
  onAddClick: () => void
}

function DailyReportFilters({
  reportView,
  onReportViewChange,
  selectedDate,
  onSelectedDateChange,
  selectedWeekDate,
  onSelectedWeekDateChange,
  selectedMonthDate,
  onSelectedMonthDateChange,
  onCalendarOpenChange,
  selectedTeamFilter,
  onSelectedTeamFilterChange,
  teamFilterOptions,
  onAddClick,
}: DailyReportFiltersProps) {
  return (
    <div className="daily-report-toolbar" aria-label="Daily report controls">
      <div className="daily-report-filter" role="group" aria-label="Daily report calendar filter">
        <label htmlFor="dailyReportFilterType">Filter</label>
        <select
          id="dailyReportFilterType"
          value={reportView}
          onChange={(event) => onReportViewChange(event.target.value as ReportView)}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        {reportView === 'day' && (
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => onSelectedDateChange(date ?? selectedDate)}
            onCalendarOpen={() => onCalendarOpenChange(true)}
            onCalendarClose={() => onCalendarOpenChange(false)}
            dateFormat="yyyy-MM-dd"
            className="daily-report-calendar-input"
            popperClassName="daily-report-calendar-popper"
            calendarClassName="daily-report-calendar"
            portalId="daily-report-datepicker-portal"
            popperPlacement="bottom-start"
            popperProps={{ strategy: 'fixed' }}
            closeOnScroll={false}
            showPopperArrow={false}
            aria-label="Choose report day"
          />
        )}

        {reportView === 'week' && (
          <DatePicker
            selected={selectedWeekDate}
            onChange={(date: Date | null) => onSelectedWeekDateChange(date ?? selectedWeekDate)}
            onCalendarOpen={() => onCalendarOpenChange(true)}
            onCalendarClose={() => onCalendarOpenChange(false)}
            showWeekPicker
            dateFormat="'Week of' yyyy-MM-dd"
            className="daily-report-calendar-input"
            popperClassName="daily-report-calendar-popper"
            calendarClassName="daily-report-calendar"
            portalId="daily-report-datepicker-portal"
            popperPlacement="bottom-start"
            popperProps={{ strategy: 'fixed' }}
            closeOnScroll={false}
            showPopperArrow={false}
            aria-label="Choose report week"
          />
        )}

        {reportView === 'month' && (
          <DatePicker
            selected={selectedMonthDate}
            onChange={(date: Date | null) => onSelectedMonthDateChange(date ?? selectedMonthDate)}
            onCalendarOpen={() => onCalendarOpenChange(true)}
            onCalendarClose={() => onCalendarOpenChange(false)}
            showMonthYearPicker
            dateFormat="yyyy-MM"
            className="daily-report-calendar-input"
            popperClassName="daily-report-calendar-popper"
            calendarClassName="daily-report-calendar"
            portalId="daily-report-datepicker-portal"
            popperPlacement="bottom-start"
            popperProps={{ strategy: 'fixed' }}
            closeOnScroll={false}
            showPopperArrow={false}
            aria-label="Choose report month"
          />
        )}

        <label htmlFor="dailyReportTeamFilter">Team</label>
        <select
          id="dailyReportTeamFilter"
          value={selectedTeamFilter}
          onChange={(event) => onSelectedTeamFilterChange(event.target.value)}
          aria-label="Filter by team"
        >
          <option value="all">All teams</option>
          {teamFilterOptions.map((teamName) => (
            <option key={teamName} value={teamName}>
              {teamName}
            </option>
          ))}
        </select>
      </div>

      <button className="daily-report-add-button" type="button" onClick={onAddClick}>
        Add Daily Report
      </button>
    </div>
  )
}

export default DailyReportFilters