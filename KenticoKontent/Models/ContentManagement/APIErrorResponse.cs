using System;
using System.Linq;

using Newtonsoft.Json;

namespace KenticoKontent.Models.ContentManagement
{
    public class APIErrorResponse
    {
        public string Message { get; set; }

        [JsonProperty("validation_errors")]
        public ValidationError[] ValidationErrors { get; set; }

        public Exception GetException()
        {
            var message = Message;

            if (ValidationErrors != null && ValidationErrors.Any())
            {
                message += string.Join(", ", ValidationErrors.Select(error => $"{error.Path}: {error.Message}"));
            }

            return new Exception(message);
        }
    }

    public class ValidationError
    {
        public string Message { get; set; }

        public string Path { get; set; }
    }
}