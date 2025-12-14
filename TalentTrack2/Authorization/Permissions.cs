namespace TalentTrack2.Authorization
{
    public static class Permissions
    {
        public static class Jobs
        {
            public const string View = "Permissions.Jobs.View";
            public const string Create = "Permissions.Jobs.Create";
            public const string Edit = "Permissions.Jobs.Edit";
            public const string Delete = "Permissions.Jobs.Delete";
            public const string Approve = "Permissions.Jobs.Approve";
        }

        public static class Dashboard
        {
            public const string ViewAdmin = "Permissions.Dashboard.ViewAdmin";
            public const string ViewEmployer = "Permissions.Dashboard.ViewEmployer";
            public const string ViewEmployee = "Permissions.Dashboard.ViewEmployee";
        }

        public static class Categories
        {
            public const string Manage = "Permissions.Categories.Manage";
        }

        public static class Users
        {
            public const string View = "Permissions.Users.View";
            public const string Manage = "Permissions.Users.Manage";
        }

        public static class Applications
        {
            public const string Create = "Permissions.Applications.Create";
            public const string ViewMy = "Permissions.Applications.ViewMy";
            public const string Withdraw = "Permissions.Applications.Withdraw";
            public const string ViewJobApplications = "Permissions.Applications.ViewJobApplications";
            public const string ViewDetail = "Permissions.Applications.ViewDetail";
            public const string ManageStatus = "Permissions.Applications.ManageStatus";
            public const string ViewHistory = "Permissions.Applications.ViewHistory";
        }

        public static class Interviews
        {
            public const string Schedule = "Permissions.Interviews.Schedule";
            public const string View = "Permissions.Interviews.View";
            public const string Edit = "Permissions.Interviews.Edit";
            public const string Cancel = "Permissions.Interviews.Cancel";
        }

        public static class Notifications
        {
            public const string Access = "Permissions.Notifications.Access";
            public const string Broadcast = "Permissions.Notifications.Broadcast";
        }

        public static class Audit
        {
            public const string View = "Permissions.Audit.View";
        }
    }
}
