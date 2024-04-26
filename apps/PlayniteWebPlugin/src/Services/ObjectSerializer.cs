using Playnite.SDK;
using System;
using System.Text.Json;

namespace PlayniteWeb.Services
{
    public class ObjectSerializer : ISerializeObjects
    {
        public string Serialize(object data)
        {
            try
            {
                // Check if the object is of type System.Type and handle it specially
                if (data is Type typeData)
                {
                    // Serialize the AssemblyQualifiedName of the type
                    return JsonSerializer.Serialize(typeData.AssemblyQualifiedName, new JsonSerializerOptions(JsonSerializerDefaults.Web));
                }

                // Proceed with normal serialization for other types of data
                return JsonSerializer.Serialize(data, new JsonSerializerOptions(JsonSerializerDefaults.Web));
            }
            catch (NotSupportedException nse)
            {
                // Specific catch for NotSupportedException to handle serialization issues more specifically
                LogManager.GetLogger().Error($"Unsupported serialization attempt for type {data.GetType()}: {nse.Message}");
                throw;
            }
            catch (Exception error)
            {
                // General exception handling
                LogManager.GetLogger().Error($"Error serializing object of type {data.GetType()}: {error}");
                throw;
            }
        }
    }
}
