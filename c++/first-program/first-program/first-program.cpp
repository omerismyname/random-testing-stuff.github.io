#include "pch.h"
#include <iostream>
#include <string>
#include <windows.h>
#include <conio.h>

using namespace std;
HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);

class player {
	public:
		int x = 6;
		int y = 6;
};

/*int pattern[][2] = {
	{6, 6}
};

char getPixel(int x, int y) {
	for (int p = 0; p < (sizeof(pattern) / sizeof(*pattern)); p++) {
		if (x == pattern[p][0] && y == pattern[p][1]) {
			SetConsoleTextAttribute(hConsole, 255);
			return ' ';
		}
	}
	SetConsoleTextAttribute(hConsole, 128);
	return ' ';
}*/

void drawScreen(player Player)
{
	for (int y = 0; y < 10; y++) {
		for (int x = 0; x < 50; x++) {
			if (x == Player.x && y == Player.y) {
				SetConsoleTextAttribute(hConsole, 255);
			}
			else {
				SetConsoleTextAttribute(hConsole, 128);
			}
			cout << ' ';
		}
		cout << '\n';
	}

	cout << "\n\n\n\n";
}

player moveplayer(player Player, char input) {
	switch (input) {
	case 'w':
		Player.y++;
	case 'a':
		Player.x++;
	case 's':
		Player.y--;
	case 'd':
		Player.x--;
	}
	drawScreen(Player);
	return Player;
}

int main() {
	player Player;
	char inputchar = 'w';
	drawScreen(Player);
	for (int i = 0; i < 10; i++) {
		_getch() >> inputchar;
		SetConsoleTextAttribute(hConsole, 15);
		system("CLS");
		Player = moveplayer(Player, inputchar);
	}

	SetConsoleTextAttribute(hConsole, 15);
	return 0;
}