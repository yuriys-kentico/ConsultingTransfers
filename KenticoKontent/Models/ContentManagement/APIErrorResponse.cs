using Newtonsoft.Json;

using System;
using System.Collections.Generic;
using System.Linq;

namespace KenticoKontent.Models.ContentManagement
{
    public class APIErrorResponse
    {
        public string? Message { get; set; }

        [JsonProperty("validation_errors")]
        public IEnumerable<ValidationError>? ValidationErrors { get; set; }

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
        public string? Message { get; set; }

        public string? Path { get; set; }
    }
}