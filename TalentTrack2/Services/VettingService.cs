namespace TalentTrack2.Services
{
    public interface IVettingService
    {
        int CalculateMatchScore(string requirements, string candidateText);
    }

    public class VettingService : IVettingService
    {
        public int CalculateMatchScore(string requirements, string candidateText)
        {
            if (string.IsNullOrWhiteSpace(requirements) || string.IsNullOrWhiteSpace(candidateText))
                return 0;

            // Normalize text
            var normalizedRequirements = requirements.ToLower();
            var normalizedCandidateText = candidateText.ToLower();

            // Extract keywords (simple tokenization by common delimiters)
            var delimiters = new[] { ' ', ',', '.', ';', ':', '\n', '\r', '-', '/' };
            var requirementKeywords = normalizedRequirements
                .Split(delimiters, StringSplitOptions.RemoveEmptyEntries)
                .Where(k => k.Length > 2) // Ignore short words
                .Distinct()
                .ToList();

            if (!requirementKeywords.Any())
                return 0;

            // Count matches
            int matchCount = 0;
            foreach (var keyword in requirementKeywords)
            {
                if (normalizedCandidateText.Contains(keyword))
                {
                    matchCount++;
                }
            }

            // Calculate percentage
            double score = (double)matchCount / requirementKeywords.Count * 100;
            return (int)Math.Min(100, score);
        }
    }
}
