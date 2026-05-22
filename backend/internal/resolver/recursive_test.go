package resolver

import "testing"

func TestNormalizeDomain(t *testing.T) {
	tests := map[string]string{
		"leetcode.com":                        "leetcode.com",
		"leetcode.com/username/":              "leetcode.com",
		"https://leetcode.com/username/":      "leetcode.com",
		"https://vercel.com/":                 "vercel.com",
		"vercel.com/path?foo=bar":             "vercel.com",
		"  https://sub.example.com/a/b  ":     "sub.example.com",
		"Visit https://www.linkedin.com/ now": "www.linkedin.com",
		"URL: www.linkedin.com/feed/":         "www.linkedin.com",
	}

	for input, expected := range tests {
		if got := normalizeDomain(input); got != expected {
			t.Fatalf("normalizeDomain(%q) = %q, want %q", input, got, expected)
		}
	}
}

func TestNormalizeDomainCandidates(t *testing.T) {
	tests := map[string][]string{
		"https://www.linkedin.com/feed/": {"www.linkedin.com", "linkedin.com"},
		"www.linkedin.com":               {"www.linkedin.com", "linkedin.com"},
		"leetcode.com/username/":         {"leetcode.com"},
	}

	for input, expected := range tests {
		got := normalizeDomainCandidates(input)
		if len(got) != len(expected) {
			t.Fatalf("normalizeDomainCandidates(%q) = %v, want %v", input, got, expected)
		}
		for index := range expected {
			if got[index] != expected[index] {
				t.Fatalf("normalizeDomainCandidates(%q)[%d] = %q, want %q", input, index, got[index], expected[index])
			}
		}
	}
}
