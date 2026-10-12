#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        string st;
        bool ok = true;
        for (char ch : s) {
            if (ch == '(' || ch == '[' || ch == '{') {
                st.push_back(ch);
            } else {
                char want = ch == ')' ? '(' : ch == ']' ? '[' : '{';
                if (st.empty() || st.back() != want) {
                    ok = false;
                    break;
                }
                st.pop_back();
            }
        }
        cout << (ok && st.empty() ? "YES" : "NO") << '\n';
    }
    return 0;
}
