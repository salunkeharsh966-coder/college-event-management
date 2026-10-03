package com.college.eventmanagement.dto;

/**
 * A single KPI shown at the top of the admin dashboard,
 * e.g. { "label": "Total Events", "value": 7, "icon": "calendar" }
 */
public class DashboardStat {

    private String label;
    private long value;
    private String icon;
    private String hint;

    public DashboardStat() { }

    public DashboardStat(String label, long value, String icon, String hint) {
        this.label = label;
        this.value = value;
        this.icon = icon;
        this.hint = hint;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getValue() { return value; }
    public void setValue(long value) { this.value = value; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
