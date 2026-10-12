#include <bits/stdc++.h>
using namespace std;

int main() {
    long long k;
    cin >> k;
    string msg;
    getline(cin, msg);  // rest of the first line
    getline(cin, msg);
    int shift = k % 26;
    for (char &ch : msg) {
        if (ch >= 'a' && ch <= 'z') ch = 'a' + (ch - 'a' - shift + 26) % 26;
        else if (ch >= 'A' && ch <= 'Z') ch = 'A' + (ch - 'A' - shift + 26) % 26;
    }
    cout << msg << '\n';
    return 0;
}
