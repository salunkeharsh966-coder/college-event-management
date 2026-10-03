package com.college.eventmanagement.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Everything the admin dashboard needs in one response:
 * the four KPI cards, a simple bar chart of registrations per event and
 * the "X of Y seats filled" progress bars.
 */
public class DashboardStatsResponse {

    private List<DashboardStat> statistics = new ArrayList<>();

    /** label/value pairs for the bar chart (registrations per event). */
    private List<String> chartLabels = new ArrayList<>();
    private List<Long> chartValues = new ArrayList<>();

    /** label/value pairs for registrations per department. */
    private List<String> departmentLabels = new ArrayList<>();
    private List<Long> departmentValues = new ArrayList<>();

    /** Fill-level of each event, for the progress bars. */
    private List<EventFillLevel> fillLevels = new ArrayList<>();

    public DashboardStatsResponse() { }

    // ---------------- getters and setters ----------------

    public List<DashboardStat> getStatistics() { return statistics; }
    public void setStatistics(List<DashboardStat> statistics) {
        this.statistics = statistics;
    }

    public List<String> getChartLabels() { return chartLabels; }
    public void setChartLabels(List<String> chartLabels) {
        this.chartLabels = chartLabels;
    }

    public List<Long> getChartValues() { return chartValues; }
    public void setChartValues(List<Long> chartValues) {
        this.chartValues = chartValues;
    }

    public List<String> getDepartmentLabels() { return departmentLabels; }
    public void setDepartmentLabels(List<String> departmentLabels) {
        this.departmentLabels = departmentLabels;
    }

    public List<Long> getDepartmentValues() { return departmentValues; }
    public void setDepartmentValues(List<Long> departmentValues) {
        this.departmentValues = departmentValues;
    }

    public List<EventFillLevel> getFillLevels() { return fillLevels; }
    public void setFillLevels(List<EventFillLevel> fillLevels) {
        this.fillLevels = fillLevels;
    }

    /** Inner class: how full one event is. */
    public static class EventFillLevel {
        private String title;
        private int registered;
        private int capacity;
        private int percent;

        public EventFillLevel() { }

        public EventFillLevel(String title, int registered, int capacity) {
            this.title = title;
            this.registered = registered;
            this.capacity = capacity;
            this.percent = capacity == 0 ? 0
                    : (int) Math.round(registered * 100.0 / capacity);
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public int getRegistered() { return registered; }
        public void setRegistered(int registered) { this.registered = registered; }

        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }

        public int getPercent() { return percent; }
        public void setPercent(int percent) { this.percent = percent; }
    }
}
