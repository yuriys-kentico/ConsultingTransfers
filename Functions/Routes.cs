namespace Functions
{
    public static class Routes
    {
        public const string CreateTransfer = "transfers/create/{region:alpha:length(2)}";
        public const string GetTransfer = "transfers/get";
        public const string ListTransfers = "transfers/list/{specificRegion:alpha:length(2)?}";
        public const string ResumeTransfer = "transfers/resume";
        public const string SuspendTransfer = "transfers/suspend";
        public const string TransferFileProxy = "transfers/{region:alpha:length(2)}/{*storagePath}";
        public const string UpdateTransfer = "transfers/update";
        public const string KontentWebhook = "webhook/{region:alpha:length(2)}";
    }
}