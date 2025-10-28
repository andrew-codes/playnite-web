using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PlayniteWebMqtt.Services
{
    // Custom JsonConverter for System.Type
    public class TypeConverter : JsonConverter<Type>
    {
        public override Type Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotSupportedException("Deserialization of System.Type is not supported.");
        }

        public override void Write(Utf8JsonWriter writer, Type value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.AssemblyQualifiedName);
        }
    }

  public class ObjectSerializer : ISerializeObjects
    {
        public string Serialize(object data)
        {
            var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
                Converters = { new TypeConverter() }
            };

            try
            {
                // Use the custom options with the TypeConverter
                return JsonSerializer.Serialize(data, options);
            }
            catch (NotSupportedException nse)
            {
                // Specific catch for NotSupportedException to handle serialization issues more specifically
                LogManager.GetLogger().Error($"Unsupported serialization attempt for {data.GetType()}: {nse.Message}");
                throw;
            }
            catch (Exception error)
            {
                // General exception handling
                LogManager.GetLogger().Error($"Error serializing object: {error}");
                throw;
            }
        }
    }
}
