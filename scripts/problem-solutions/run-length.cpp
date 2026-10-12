#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    string out;
    for (size_t i = 0; i < s.size();) {
        size_t j = i;
        while (j < s.size() && s[j] == s[i]) j++;
        out += s[i];
        out += to_string(j - i);
        i = j;
    }
    cout << out << '\n';
    return 0;
}
