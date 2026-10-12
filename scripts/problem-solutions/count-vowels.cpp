#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    int count = 0;
    for (char ch : s)
        if (string("aeiouAEIOU").find(ch) != string::npos) count++;
    cout << count << '\n';
    return 0;
}
