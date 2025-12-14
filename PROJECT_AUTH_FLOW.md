# TalentTrack Project: Authentication & Authorization Flow

This document provides a comprehensive explanation of how the TalentTrack project handles user registration, login, OTP verification, and role-based access control.

---

## 1. Registration Flow
**Goal**: Create a new user account with a specific role.

### Frontend (`src/auth/Register.jsx`)
1.  **User Action**: The user selects a role (Job Seeker, Employer, Administrator) and fills in their details (Name, Email, Password).
2.  **Logic**:
    *   The component maintains a `role` state variable.
    *   Based on the selected role, it calls a specific API function: `registerEmployee`, `registerEmployer`, or `registerAdmin`.
3.  **API Call**: Sends a `POST` request to the backend.

### Backend (`Controllers/AuthController.cs` & `Services/AuthService.cs`)
1.  **Endpoints**:
    *   `/api/auth/register/employee`
    *   `/api/auth/register/employer`
    *   `/api/auth/register/admin`
2.  **Processing (`AuthService.cs` -> `RegisterAsync`)**:
    *   **Validation**: Checks if the email already exists in the database.
    *   **User Creation**: Creates a new `AppUser` entity.
    *   **Role Assignment**: Assigns the requested role (e.g., "Employer") to the user using ASP.NET Core Identity.
3.  **Result**: Returns a success message. The frontend then redirects the user to the Login page.

---

## 2. Login Flow (Part 1: Credentials)
**Goal**: Validate email/password and initiate the 2FA process.

### Frontend (`src/auth/Login.jsx`)
1.  **User Action**: User enters Email and Password.
2.  **API Call**: Sends a `POST` request to `/api/auth/login`.

### Backend (`Services/AuthService.cs` -> `LoginAsync`)
1.  **Credential Check**: Verifies that the email exists and the password matches.
2.  **Account Status**: Checks if the account is active (`!user.IsActive`).
3.  **OTP Generation**:
    *   Instead of returning a login token immediately, the system generates a 6-digit OTP.
    *   It saves this OTP in the `OtpCodes` database table (valid for 10 minutes).
    *   It sends the OTP to the user's email via `EmailService`.
4.  **Response**: Returns a JSON object indicating that OTP is required:
    ```json
    {
      "isSuccess": true,
      "requiresOtp": true,
      "userId": "user-guid-here",
      "message": "OTP sent to your email."
    }
    ```

### Frontend Handling
*   The `Login.jsx` component sees `requiresOtp: true`.
*   It **does not** log the user in yet.
*   It redirects to `/otp-verify`, passing the `userId` in the navigation state.

---

## 3. OTP Flow (Part 2: Verification)
**Goal**: Verify the code and issue the access token.

### Frontend (`src/auth/OtpVerification.jsx`)
1.  **User Action**: User enters the 6-digit code received in their email.
2.  **API Call**: Sends a `POST` request to `/api/auth/verify-otp` with the `userId` and `code`.

### Backend (`Services/AuthService.cs` -> `VerifyOtpAsync`)
1.  **Validation**:
    *   Finds the OTP record for the given User ID.
    *   Checks if the code matches.
    *   Checks if the code has expired (older than 10 minutes).
    *   Checks if the code has already been used.
2.  **Token Generation**:
    *   If valid, the system finally generates a **JWT (JSON Web Token)**.
    *   This token contains "Claims" (data embedded in the token):
        *   `UserId`
        *   `Email`
        *   `Role` (e.g., "Employer")
        *   `Permissions`
3.  **Response**: Returns the JWT Token and the User's Role.

### Frontend Handling
*   The app saves the token (usually in LocalStorage or Context).
*   The user is now considered "Logged In".
*   The app redirects the user to their specific dashboard based on their role.

---

## 4. Role-Based Access Control (RBAC)
**Goal**: Ensure users can only see pages and data relevant to their role.

### Frontend Protection (`src/App.jsx`)
The application uses a `ProtectedRoute` wrapper component to guard routes.

*   **Admin Routes** (`/admin/*`):
    *   Allowed Roles: `['Admin']`
    *   Access to: Dashboard, User Management, Job Approval, Categories, Audit Logs.
*   **Employer Routes** (`/employer/*`):
    *   Allowed Roles: `['Employer']`
    *   Access to: Dashboard, Post Jobs, View Applicants, Interviews.
*   **Employee Routes** (`/employee/*`):
    *   Allowed Roles: `['Employee']`
    *   Access to: Job Search, My Applications, Scheduled Interviews.

If a user tries to access a route they are not authorized for (e.g., an Employee trying to go to `/admin/dashboard`), the `ProtectedRoute` component redirects them to `/unauthorized`.

### Backend Protection (`Controllers/*.cs`)
The API endpoints are also protected to prevent unauthorized data access (even if someone bypasses the frontend).

*   **Attributes**: Controllers use the `[Authorize]` attribute.
    *   Example: `[Authorize(Roles = "Admin")]`
    *   Example: `[Authorize(Policy = Permissions.Jobs.Create)]`
*   **How it works**: When the frontend makes a request, it sends the JWT Token in the header. The backend reads the `Role` claim from that token to decide if the request should be allowed.

---

## Summary of Key Files

| Feature | Frontend File | Backend File |
| :--- | :--- | :--- |
| **Registration** | `src/auth/Register.jsx` | `Controllers/AuthController.cs`<br>`Services/AuthService.cs` |
| **Login** | `src/auth/Login.jsx` | `Services/AuthService.cs` (`LoginAsync`) |
| **OTP** | `src/auth/OtpVerification.jsx` | `Services/AuthService.cs` (`VerifyOtpAsync`) |
| **Routing** | `src/App.jsx` | N/A |
| **Permissions** | `src/utils/permissions.js` | `Authorization/Permissions.cs` |

## How to Modify Common Things

1.  **Disable OTP**:
    *   Go to `TalentTrack2/Services/AuthService.cs`.
    *   In `LoginAsync`, comment out `await SendOtpAsync(user.Id);`.
    *   Change the return statement to generate the token immediately (copy logic from `VerifyOtpAsync`).

2.  **Add a New Registration Field (e.g., Phone Number)**:
    *   **Frontend**: Add input to `Register.jsx` and update the state object.
    *   **DTO**: Update `RegisterDto.cs` in the backend to include `PhoneNumber`.
    *   **Backend**: Update `AuthService.cs` -> `RegisterAsync` to save the new field to the `AppUser` object.

3.  **Change Redirects**:
    *   Go to `src/auth/Login.jsx` and `src/auth/OtpVerification.jsx`.
    *   Look for the `navigate(...)` calls inside the success blocks to change where users go after logging in.

4.  **Change OTP Length (e.g., to 8 digits)**:
    *   **Backend**: In `Services/AuthService.cs` (inside `SendOtpAsync`), change the random number generation:
        ```csharp
        // From (6 digits):
        var code = new Random().Next(100000, 999999).ToString();
        // To (8 digits):
        var code = new Random().Next(10000000, 99999999).ToString();
        ```
    *   **Frontend**: In `src/auth/OtpVerification.jsx`:
        *   Update validation: `if (!otp || otp.length < 8) ...`
        *   Update input: `maxLength="8"` and `placeholder="12345678"`
