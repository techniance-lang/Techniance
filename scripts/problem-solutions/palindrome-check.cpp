#include <bits/stdc++.h>
using namespace std;

int main() {
    string line, s;
    getline(cin, line);
    for (unsigned char ch : line)
        if (isalnum(ch)) s += (char)tolower(ch);
    string r(s.rbegin(), s.rend());
    cout << (s == r ? "YES" : "NO") << '\n';
    return 0;
}
