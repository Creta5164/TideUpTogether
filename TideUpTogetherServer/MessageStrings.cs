using System.Globalization;
using System.Text.RegularExpressions;
using CsvHelper;
using CsvHelper.Configuration;

namespace TideUpTogetherServer;

public static class MessageTable {
    
    const string MESSAGE_TABLE_PATH = "../MessageTable.csv";
    
    public static string[] BaseTemplates { get; private set; } = [];
    public static string[][] Words { get; private set; } = [];
    public static string[] Adverbs { get; private set; } = [];
    
    public static bool IsLoaded => BaseTemplates.Length > 0;
    
    public static void Initialize() {
        
        if (!File.Exists(MESSAGE_TABLE_PATH)) {
            
            Console.WriteLine($"[{nameof(MessageTable)}] {MESSAGE_TABLE_PATH} not found, message strings will not be available.");
            return;
        }
        
        string content = File.ReadAllText(MESSAGE_TABLE_PATH);
        
        var config = new CsvConfiguration(CultureInfo.InvariantCulture) {
            HasHeaderRecord = false
        };
        
        using var reader = new StringReader(content);
        using var parser = new CsvParser(reader, config);
        
        var rows = new List<string[]>();
        
        while (parser.Read())
            rows.Add(parser.Record ?? []);
        
        //Row 0: 베이스 (base templates)
        if (rows.Count > 0)
            BaseTemplates = rows[0].Skip(1).Where(s => !string.IsNullOrEmpty(s)).ToArray();
        
        //Rows 1-6: 장소, 행동, 대상, 방향, 물건, 속삭임
        var wordTypes = new List<string[]>();
        
        for (int i = 1; i <= 6 && i < rows.Count; i++)
            wordTypes.Add(rows[i].Skip(1).Where(s => !string.IsNullOrEmpty(s)).ToArray());
        
        Words = [.. wordTypes];
        
        //Row 7: 접두사 (adverbs)
        if (rows.Count > 7)
            Adverbs = rows[7].Skip(1).Where(s => !string.IsNullOrEmpty(s)).ToArray();
        
        Console.WriteLine($"[{nameof(MessageTable)}] Loaded {BaseTemplates.Length} templates, {Words.Length} word types, {Adverbs.Length} adverbs.");
    }
}
