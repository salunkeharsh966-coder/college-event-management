package com.college.eventmanagement.entity;

/**
 * Life-cycle status of an event.
 *
 * UPCOMING  - announced, registration not open yet
 * OPEN      - students can register
 * CLOSED    - registration closed (deadline passed or filled up)
 * CANCELLED - event called off
 * COMPLETED - event has finished
 */
public enum EventStatus {
    UPCOMING,
    OPEN,
    CLOSED,
    CANCELLED,
    COMPLETED
}
