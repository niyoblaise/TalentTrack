# TalentTrack Project: Complete System Walkthrough

This document provides a detailed explanation of how every major feature in the TalentTrack system works, from the database level up to the user interface.

---

## 1. Authentication & Roles
*(See `PROJECT_AUTH_FLOW.md` for the deep dive on Login/Registration)*

**Quick Summary**:
- **Roles**: Admin, Employer, Employee (Job Seeker).
- **Security**: Uses JWT (JSON Web Tokens) for API access.
- **2FA**: Login requires an OTP sent to email.

---

## 2. Dashboard & Statistics
Each role sees a different dashboard calculated by `DashboardController.cs`.

### Admin Dashboard
**Goal**: System-wide overview.
- **Key Metrics**: Total Users, Active vs Deactivated Users, Total Jobs (Approved/Pending), Total Applications.
- **Charts**:
    - **User Growth**: Number of new users registered per month (last 6 months).
    - **Application Trends**: Number of applications submitted per month.
    - **Job Categories**: Pie chart showing distribution of jobs across categories (IT, Healthcare, etc.).
- **Implementation**: Aggregates data from `AspNetUsers`, `Jobs`, and `JobApplications` tables.

### Employer Dashboard
**Goal**: Recruitment performance.
- **Key Metrics**: Total Jobs Posted, Total Applications Received, Hired Candidates, Total Job Views.
- **Charts**:
    - **Applications Over Time**: Line chart of applications received for *their* jobs.
    - **Applicant Status**: Breakdown of candidates (Pending vs Interview vs Hired).
- **Recent Activity**: Shows the last 5 actions (e.g., "John Doe applied for Software Engineer").

### Employee Dashboard
**Goal**: Job search progress.
- **Key Metrics**: Total Applications, Interviews Scheduled, Offers (Hired), Rejections.
- **Success Rates**: Calculates "Hire Rate" and "Rejection Rate" percentages.
- **Status Distribution**: Visual breakdown of where their applications stand.

---

## 3. Job Management Flow

### Posting a Job (Employer)
1.  **Frontend**: Employer fills out Title, Description, Requirements, Salary, etc.
2.  **Backend** (`JobsController.cs` -> `CreateJob`):
    - Saves the job with `IsApproved = false`.
    - Sets `Status = "Open"`.
3.  **Result**: The job is **NOT** visible to employees yet. It enters the "Approval Queue".

### Approving a Job (Admin)
1.  **Process**: Admin goes to "Job Approval Queue".
2.  **Action**: Admin reviews the job content.
    - **Approve**: Sets `IsApproved = true`. The job now appears in search results. Triggers a notification to the Employer.
    - **Reject**: Admin provides a reason. Sets `Status = "Rejected"`. The job remains hidden. Triggers a notification to the Employer.

### Viewing Jobs (Employee/Public)
- **Logic**: The API (`GET /api/jobs`) filters to return **only** jobs where `IsApproved == true`.
- **View Counting**: When a user clicks a job, the backend increments the `Views` counter in the database.

---

## 4. Application Process

### Applying (Employee)
1.  **Input**: Employee uploads a CV (PDF/Doc) and writes a Cover Letter.
2.  **Security**:
    - The backend **encrypts** the file path of the uploaded CV using `EncryptionService.cs` before saving it to the database. This ensures file paths aren't exposed.
3.  **Auto-Vetting**:
    - The `VettingService.cs` analyzes the Cover Letter against the Job Requirements.
    - It assigns a **Match Score** (0-100%) to help employers prioritize candidates.
4.  **Notification**: The Employer receives a notification: "New Application for [Job Title] (Match: 85%)".

### Managing Applications (Employer)
1.  **View Applicants**: Employer sees a list of candidates with their Match Scores.
2.  **Review**: Clicking a candidate decrypts the CV path and allows the employer to download/view it.
3.  **Status Changes**:
    - **Screening**: Mark candidate as being reviewed.
    - **Interview**: (See below).
    - **Hired**: Marks the process as successful.
    - **Rejected**: Requires a rejection reason.
4.  **Feedback**: Every status change sends a notification to the Employee.

### Withdrawing (Employee)
- An employee can withdraw their application *unless* they have already been hired.
- This marks the status as "Withdrawn" and notifies the employer.

---

## 5. Interview System

### Scheduling (Employer)
1.  **Action**: Employer clicks "Schedule Interview" on an application.
2.  **Input**: Date, Time, Meeting Link (e.g., Zoom/Teams), and Location.
3.  **Backend** (`InterviewsController.cs`):
    - Validates the date is in the future.
    - Creates an `Interview` record.
    - Automatically updates the Application Status to **"Interview"**.
    - Adds an entry to the Application History.
4.  **Notification**: Employee gets a notification with the date and link.

### Viewing (Both)
- **Employee**: Sees a list of their upcoming interviews in "My Interviews".
- **Employer**: Sees a calendar/list of interviews they have organized.

---

## 6. Admin Management Features

### User Management
- **List Users**: Admin can see all users, filter by Role (Admin/Employer/Employee) or Status (Active/Inactive).
- **Deactivation**: Admin can ban a user for a specific number of days.
    - **Effect**: The user cannot log in (`AuthService` checks `IsActive`).
- **Role Management**: Admin can promote an Employee to Admin, etc.

### Broadcast Notifications
- **Feature**: Admin can send a message to **ALL users** or **ALL [Role]**.
- **Delivery**:
    1.  **Database**: Saved in `Notifications` table (visible in the notification bell).
    2.  **Real-time**: Uses **SignalR** (`NotificationHub.cs`) to pop up a toast message instantly if the user is online.

---

## 7. Technical Highlights

### SignalR (Real-time)
- Used for instant notifications.
- When an Admin approves a job, the Employer sees a popup immediately without refreshing.

### Encryption
- **CVs**: File paths are encrypted in the database so that even if the DB is leaked, the actual file locations on the server are protected.

### Audit Logging
- (If implemented in `AuditService`) Tracks critical actions like "User X deleted Job Y" for security compliance.

---

## 8. Configuration & Customization Guide

Here is where to find and change common settings in the codebase.

### A. Password Policy
**File**: `Program.cs`
**Lines**: ~24-29
**Default**: Requires Digit, Uppercase, Lowercase, Length 6.
```csharp
options.Password.RequireDigit = true;
options.Password.RequiredLength = 6; // Change to 8 or 10 for more security
options.Password.RequireUppercase = true;
```

### B. Email Settings (SMTP)
**File**: `appsettings.json`
**Section**: `"EmailSettings"`
**Usage**: Used for sending OTPs and Notifications.
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SenderEmail": "your-email@gmail.com",
  "Password": "your-app-password" 
}
```

### C. JWT Token Expiry
**File**: `appsettings.json`
**Section**: `"Jwt"`
**Default**: 7 Days.
```json
"ExpireDays": "7" // Change to "1" for stricter security
```

### D. CORS (Frontend Connection)
**File**: `Program.cs`
**Lines**: ~166
**Usage**: Defines which websites can talk to your API.
```csharp
.WithOrigins("http://localhost:5173", "http://localhost:5174") // Add your production URL here
```

### E. File Upload Path
**File**: `Controllers/ApplicationsController.cs`
**Line**: ~52
**Default**: Saves files to a folder named `uploads/cvs` in the project root.
```csharp
var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "cvs");
```

### F. Auto-Vetting Thresholds
**File**: `Controllers/ApplicationsController.cs`
**Line**: ~72
**Usage**: There is commented-out logic to automatically reject candidates with low scores.
```csharp
// Uncomment to enable auto-rejection
// if (matchScore < 10) 
// {
//     status = "Rejected";
// }
```

---

## 9. Modifying Dashboard Statistics

The logic for all charts and numbers is located in `Controllers/DashboardController.cs`.

### A. Changing the Chart Time Range
**Goal**: Show 12 months of data instead of 6.
**File**: `Controllers/DashboardController.cs`
**Lines**: ~57, ~82, ~147
**Logic**: The loop `for (int i = 5; i >= 0; i--)` creates 6 data points (current month + 5 previous).
**Change**:
```csharp
// Change 5 to 11 to show the last 12 months
for (int i = 11; i >= 0; i--) 
```

### B. Changing "Recent Activity" Count
**Goal**: Show 10 recent items instead of 5.
**File**: `Controllers/DashboardController.cs`
**Line**: ~177
**Logic**: The query uses `.Take(5)` to limit results.
**Change**:
```csharp
.Take(10) // Increase this number
```

### C. Adding New Metrics
**Goal**: Count something new (e.g., "Total Interviews Scheduled").
1.  **DTO**: Add a new property `public int TotalInterviews { get; set; }` to `DTOs/DashboardDtos.cs`.
2.  **Controller**: In `DashboardController.cs`, calculate the value:
    ```csharp
    var interviewCount = await _context.Interviews.CountAsync();
    ```
3.  **Response**: Assign it to the DTO:
    ```csharp
    var stats = new AdminDashboardDto 
    {
        // ... existing properties
        TotalInterviews = interviewCount
    };
    ```
4.  **Frontend**: Display it in `src/components/Dashboard/AdminDashboard.jsx`.
