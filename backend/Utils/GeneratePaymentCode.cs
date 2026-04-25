using System;

namespace backend.Utils;

public static class GeneratePaymentCode
{
    private static readonly Random _random = new();

    public static string Generate(int length = 8)
    {
        // Removed ambiguous characters: O, 0, I, 1, L
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }
}
