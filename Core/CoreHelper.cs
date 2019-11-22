using Newtonsoft.Json;

using System;

namespace Core
{
    public static class CoreHelper
    {
        public static string? GetSetting(params string[] settingParts)
        {
            var key = string.Join(':', settingParts);

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }

        public static TValue Deserialize<TValue>(string json)
        {
            return json != null
                ? JsonConvert.DeserializeObject<TValue>(json)
                : default;
        }

        public static string Serialize<TValue>(TValue value) where TValue : notnull
        {
            return JsonConvert.SerializeObject(value);
        }
    }
}