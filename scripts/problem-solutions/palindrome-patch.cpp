#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    int n = s.size();
    // need[i][j] = fewest insertions that make s[i..j] a palindrome, filled by increasing length.
    vector<vector<int>> need(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            need[i][j] = s[i] == s[j] ? (len == 2 ? 0 : need[i + 1][j - 1]) : 1 + min(need[i + 1][j], need[i][j - 1]);
        }
    }
    cout << need[0][n - 1] << '\n';
    return 0;
}
