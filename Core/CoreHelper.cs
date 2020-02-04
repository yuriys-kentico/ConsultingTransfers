using Newtonsoft.Json;

using System;

namespace Core
{
    public static class CoreHelper
    {
        public static T GetSetting<T>(params string[] settingParts) where T : notnull
        {
            var key = string.Join(':', settingParts);
            var variable = Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
            var setting = Convert.ChangeType(variable, typeof(T));

            return (T)(setting ?? throw new ArgumentException($"Setting '{key}' not found."));
        }

        public static TValue Deserialize<TValue>(string json)
        {
            return json != default
                ? JsonConvert.DeserializeObject<TValue>(json)
                : throw new ArgumentNullException(json);
        }

        public static string Serialize<TValue>(TValue value) where TValue : notnull
        {
            return JsonConvert.SerializeObject(value);
        }
    }
}