# Business Rules

This document describes the business rules implemented in the Coriga system.

## Reservation Rules

### Date Uniqueness
- Each date can only have one reservation
- Attempting to create a reservation for an already booked date will fail

### Resident Status
- Only active residents can make new reservations
- Inactive residents cannot create reservations
- Deactivating a resident preserves their reservation history

### Pricing Calculation
- Reservation price is automatically calculated based on the day type
- **Weekday**: Uses `weekdayPrice` from pricing configuration
- **Weekend**: Uses `weekendPrice` from pricing configuration
- **Holiday**: Uses `holidayPrice` from pricing configuration
- Holidays override weekend pricing (a holiday on Saturday uses holiday price)

## Payment Rules

### Payment Status
- Payment status is automatically updated based on paid amount:
  - **Pending**: No payments recorded
  - **Partial**: Some amount paid, but not the full reservation price
  - **Paid**: Full reservation price has been paid

### Partial Payments
- Multiple partial payments can be recorded for a single reservation
- Each payment records:
  - Amount paid
  - Payment method (cash, PIX, credit card, debit card)
  - Payment date

### Payment Methods
- **cash**: Cash payment
- **pix**: PIX (Brazilian instant payment system)
- **credit**: Credit card
- **debit**: Debit card

## Holiday Rules

### Holiday Types
- **national**: Brazilian national holidays
- **municipal**: Municipal/city holidays
- **community**: Condominium-specific dates (e.g., community anniversary)

### Pricing Impact
- Holidays use the `holidayPrice` from pricing configuration
- If a holiday falls on a weekend, the holiday price takes precedence
- Holidays are displayed with a distinct color on the calendar

## Resident Rules

### Active/Inactive Status
- New residents are created as active by default
- Deactivating a resident:
  - Prevents new reservations
  - Preserves existing reservation history
  - Does not affect existing payments

### Required Fields
- **name**: Resident's full name
- **unit**: Apartment/house number

### Optional Fields
- **phone**: Contact phone number
- **email**: Contact email address

## Cancellation Rules

### Reservation Cancellation
- Reservations can be cancelled by administrators
- Cancelled reservations:
  - Are marked with "cancelled" status
  - Remain visible in the system for historical purposes
  - Do not block the date for new reservations (date becomes available)

## Dashboard Statistics

### Monthly Statistics
- Total reservations for the month
- Confirmed reservations count
- Cancelled reservations count
- Total revenue (sum of all reservation prices)
- Pending payments count

### Upcoming Reservations
- Shows reservations for future dates
- Sorted by date (earliest first)
- Includes resident name and payment status
