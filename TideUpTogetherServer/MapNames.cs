using System.Text.Json;

namespace TideUpTogetherServer;

public static class MapNames {
    
    const string MAP_INFOS_PATH = "../MapInfos.json";
    
    static readonly Dictionary<int, string> _names = [];
    
    public static void Initialize() {
        
        _names.Clear();
        
        if (!File.Exists(MAP_INFOS_PATH)) {
            
            Console.WriteLine($"[{nameof(MapNames)}] {MAP_INFOS_PATH} not found, map names will not be available.");
            return;
        }
        
        using var stream = File.OpenRead(MAP_INFOS_PATH);
        using var doc = JsonDocument.Parse(stream);
        
        foreach (var element in doc.RootElement.EnumerateArray()) {
            
            if (element.ValueKind == JsonValueKind.Null)
                continue;
            
            var id   = element.GetProperty("id").GetInt32();
            var name = element.GetProperty("name").GetString()?.Trim();
            
            if (!string.IsNullOrEmpty(name))
                _names[id] = name;
        }
        
        Console.WriteLine($"[MapNames] Loaded {_names.Count} map names.");
    }
    
    public static string Get(int id)
        => _names.TryGetValue(id, out var name)
            ? name
            : $"ID:{id}";
}
