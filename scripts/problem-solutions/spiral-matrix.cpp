#include <bits/stdc++.h>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<vector<long long>> g(r, vector<long long>(c));
    for (auto &row : g)
        for (auto &x : row) cin >> x;
    vector<long long> out;
    int top = 0, bottom = r - 1, left = 0, right = c - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) out.push_back(g[top][j]);
        for (int i = top + 1; i <= bottom; i++) out.push_back(g[i][right]);
        if (top < bottom)
            for (int j = right - 1; j >= left; j--) out.push_back(g[bottom][j]);
        if (left < right)
            for (int i = bottom - 1; i > top; i--) out.push_back(g[i][left]);
        top++, bottom--, left++, right--;
    }
    for (size_t i = 0; i < out.size(); i++) cout << out[i] << (i + 1 < out.size() ? ' ' : '\n');
    return 0;
}
