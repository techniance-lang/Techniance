#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    string s;
    cin >> n >> s;
    int best = 0, cur = 0;
    for (char ch : s) {
        cur = ch == '1' ? cur + 1 : 0;
        best = max(best, cur);
    }
    cout << best << '\n';
    return 0;
}
