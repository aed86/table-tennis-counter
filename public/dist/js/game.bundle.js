(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Game = {
    availableStatuses: function() {
        return statuses;
    },
    init: function () {
        var self = this;
        self.id = $('#gameId').val();
        if (self.id) {
            self.getGameData(self.id).then(function (res) {
                if (res) {
                    self.gameData = res;
                    self.count(res);
                }
            });
        }
    },
    getGameData: function (id) {
        return $.ajax({
            type: 'GET',
            url: '/game/' + id + '/json'
        })
    },
    finishGame: function() {
        $.ajax({
            type: 'POST',
            url: '/game/' + self.id + '/status/' + statuses['FINISH_STATUS'],
            success: function(response) {
                if (response.success) {
                    window.location.href= '/game/' + self.id + '/detail';
                }
            }
        })
    },
    count: function (game) {
        var self = this;
        var id = self.id;

        // убираем вызов контекстного меню при клике
        document.oncontextmenu = function () {
            return false;
        };

        var totalScore = {
            player1: {
                score: game.player1.score
            },
            player2: {
                score: game.player2.score
            },
            points: game.points,
            status: game.status
        };

        var currentSet = parseInt(totalScore.player1.score) + parseInt(totalScore.player2.score);

        var checkMatchWin = function (totalScore) {
            if (totalScore.player1.score == 3 || totalScore.player2.score == 3) {
                self.finishGame();
            }
        };

        //checkMatchWin(totalScore);
        $('.block').on('mousedown', function (e) {

            if (totalScore.status == status.FINISH_STATUS) {
                alert('Game is finished')
                return;
            }

            var $this = $(this);
            var player = $this.data('player');
            var opponent = player == 1 ? 2 : 1;
            var index = "player" + player;
            var $countContainer = $this.find('.count');
            var $opponentContainer = $this.parent().find('[data-player="' + opponent + '"]').find('.count');
            var $wonsContainer = $this.find('.wons');
            var isCorrected = (e.button === 2) || false; // Если нажата правая кнопка мыши
            var isNextSet = false;
            var point = 0;
            var opponentPoint = null;

            // Манипуляции при победе в сете
            var playerWinSet = function (player) {
                var index = "player" + player;
                point = 0;
                opponentPoint = 0;
                currentSet++;
                totalScore[index].score += 1;
                $wonsContainer.html(totalScore[index].score).addClass('animated bounceIn');
            };


            if (totalScore.points.length < currentSet + 1) {
                totalScore.points.push({1: 0, 2: 0});
            }

            totalScore.points[currentSet][player] = parseInt(totalScore.points[currentSet][player]);

            if (isCorrected) {
                totalScore.points[currentSet][player] -= 1;
            } else {
                totalScore.points[currentSet][player] += 1;
            }

            if (totalScore.points[currentSet][player] < 0) {
                totalScore.points[currentSet][player] = 0
            }

            // Если было больше-меньше, и админ скорректировал счет "меньше" назад, то победа "больше"
            if (isCorrected && totalScore.points[currentSet][opponent] >= 10 && totalScore.points[currentSet][opponent] - totalScore.points[currentSet][player] > 1) {
                playerWinSet(opponent);
            } else if (totalScore.points[currentSet][player] >= 10 && totalScore.points[currentSet][player] == totalScore.points[currentSet][opponent]) {
                point = "=";
                opponentPoint = "=";
            } else if (totalScore.points[currentSet][player] >= 11) {
                if (totalScore.points[currentSet][player] - totalScore.points[currentSet][opponent] > 0) {
                    if (totalScore.points[currentSet][player] - totalScore.points[currentSet][opponent] > 1) {
                        playerWinSet(player);
                    } else {
                        point = ">";
                        opponentPoint = "<";
                    }
                }
            } else if (!isNextSet) {
                point = totalScore.points[currentSet][player];
            } else {
                point = 0;
                opponentPoint = 0;
                currentSet++;
            }

            $countContainer.html(point).addClass('animated bounceIn');
            if (opponentPoint !== null) {
                $opponentContainer.html(opponentPoint).addClass('animated bounceIn');
            }

            //TODO: Save data
            _.throttle(function () {
                self.saveGame(id, totalScore);
            }, 100)();

            checkMatchWin(totalScore);

            /*            var $this = $(this);
             var $count = $this.parents('.row').find('.count');
             var player = $this.data('player');
             var index = "player" + player;
             var current = currents[index];
             var won = wons[index];

             if (!moreless) {
             // если правая кнопка мыши
             if (e.button === 2) {
             current -= 1;
             if (current < 0) {
             current = 0;
             }
             $this.find('.count').html(current);
             } else {
             current += 1;
             $this.find('.count').html(current).addClass('animated bounceIn');
             }

             // если по 10 у обоих, то игра - "больше-меньше"
             if ($count.eq(0).html() === '10' && $count.eq(1).html() === '10') {
             $count.html('=');
             moreless = true;
             }

             // если достиг 11 - выиграл
             if (current === 11) {
             won += 1;

             $this.find('.wons').html(won).addClass('animated bounceIn');
             $count.html('0');

             // окончательный выигрыш (игроки отыграли)
             if (won === 3) {
             $this.parents('.row').find('.count').remove();
             setTimeout(function () {
             self.nextGame($this.parents('.row').index() + 1);
             }, 5000);
             }
             }

             currents[index] = current == 11 ? 0 : current;

             wons[index] = won;

             var dataToSave = {
             id: $('#gameId').val(),
             player: player,
             score: wons[index], // счет по сетам
             point: currents[index] // счет в текущей партии
             };

             _.throttle(function () {
             self.saveGame(id, dataToSave);
             }, 100)();


             if (current == 11) {
             currents = {
             player1: 0,
             player2: 0
             };
             }
             }
             // игра "больше-меньше"
             else {
             // если было поровну, то ставим нужному игроку "больше"
             if ($this.find('.count').html() === '=') {
             $count.html('-').addClass('animated bounceIn');
             $this.find('.count').html('+');
             }
             // если был 0, то уравниваем игроков
             else if ($this.find('.count').html() === '-') {
             $count.html('=').addClass('animated bounceIn');
             }
             // если было "больше", то игрок выигрывает
             else if ($this.find('.count').html() === '+') {
             won = parseInt($this.find('.wons').html());
             $this.find('.wons').html(++won);
             moreless = false;

             // окончательный выигрыш (игроки отыграли)
             if (won === 3) {
             $this.parents('.row').find('.count').remove();
             setTimeout(function () {
             self.nextGame($this.parents('.row').index() + 1);
             }, 5000);
             }
             // выигрыш в игре (продолжаем)
             else {
             $count.html('0').addClass('animated bounceIn');
             }
             }
             }

             setTimeout(function () {
             $('.count, .wons').removeClass('animated bounceIn');
             }, 500);*/
        });
    },
    nextGame: function (index) {
        var $game = $('main.content .row');
        $game.addClass('hidden');
        $game.eq(index).removeClass('hidden');
    },
    saveGame: function (id, data) {
        if (id === undefined) {
            return;
        }

        $.ajax({
            type: "POST",
            url: '/game/' + id + '/save',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (res) {
                if (!res.success) {
                    alert('Ошибка сохранения');
                } else {
                    console.log('Сохранено', data);
                }
            }
        })
    }
};

Game.init();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvanMvZ2FtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBHYW1lID0ge1xuICAgIGF2YWlsYWJsZVN0YXR1c2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHN0YXR1c2VzO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuaWQgPSAkKCcjZ2FtZUlkJykudmFsKCk7XG4gICAgICAgIGlmIChzZWxmLmlkKSB7XG4gICAgICAgICAgICBzZWxmLmdldEdhbWVEYXRhKHNlbGYuaWQpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lRGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb3VudChyZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRHYW1lRGF0YTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICB1cmw6ICcvZ2FtZS8nICsgaWQgKyAnL2pzb24nXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBmaW5pc2hHYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9nYW1lLycgKyBzZWxmLmlkICsgJy9zdGF0dXMvJyArIHN0YXR1c2VzWydGSU5JU0hfU1RBVFVTJ10sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmPSAnL2dhbWUvJyArIHNlbGYuaWQgKyAnL2RldGFpbCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgY291bnQ6IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGlkID0gc2VsZi5pZDtcblxuICAgICAgICAvLyDRg9Cx0LjRgNCw0LXQvCDQstGL0LfQvtCyINC60L7QvdGC0LXQutGB0YLQvdC+0LPQviDQvNC10L3RjiDQv9GA0Lgg0LrQu9C40LrQtVxuICAgICAgICBkb2N1bWVudC5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0b3RhbFNjb3JlID0ge1xuICAgICAgICAgICAgcGxheWVyMToge1xuICAgICAgICAgICAgICAgIHNjb3JlOiBnYW1lLnBsYXllcjEuc2NvcmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbGF5ZXIyOiB7XG4gICAgICAgICAgICAgICAgc2NvcmU6IGdhbWUucGxheWVyMi5zY29yZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvaW50czogZ2FtZS5wb2ludHMsXG4gICAgICAgICAgICBzdGF0dXM6IGdhbWUuc3RhdHVzXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGN1cnJlbnRTZXQgPSBwYXJzZUludCh0b3RhbFNjb3JlLnBsYXllcjEuc2NvcmUpICsgcGFyc2VJbnQodG90YWxTY29yZS5wbGF5ZXIyLnNjb3JlKTtcblxuICAgICAgICB2YXIgY2hlY2tNYXRjaFdpbiA9IGZ1bmN0aW9uICh0b3RhbFNjb3JlKSB7XG4gICAgICAgICAgICBpZiAodG90YWxTY29yZS5wbGF5ZXIxLnNjb3JlID09IDMgfHwgdG90YWxTY29yZS5wbGF5ZXIyLnNjb3JlID09IDMpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpbmlzaEdhbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvL2NoZWNrTWF0Y2hXaW4odG90YWxTY29yZSk7XG4gICAgICAgICQoJy5ibG9jaycpLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICBpZiAodG90YWxTY29yZS5zdGF0dXMgPT0gc3RhdHVzLkZJTklTSF9TVEFUVVMpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnR2FtZSBpcyBmaW5pc2hlZCcpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIHBsYXllciA9ICR0aGlzLmRhdGEoJ3BsYXllcicpO1xuICAgICAgICAgICAgdmFyIG9wcG9uZW50ID0gcGxheWVyID09IDEgPyAyIDogMTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IFwicGxheWVyXCIgKyBwbGF5ZXI7XG4gICAgICAgICAgICB2YXIgJGNvdW50Q29udGFpbmVyID0gJHRoaXMuZmluZCgnLmNvdW50Jyk7XG4gICAgICAgICAgICB2YXIgJG9wcG9uZW50Q29udGFpbmVyID0gJHRoaXMucGFyZW50KCkuZmluZCgnW2RhdGEtcGxheWVyPVwiJyArIG9wcG9uZW50ICsgJ1wiXScpLmZpbmQoJy5jb3VudCcpO1xuICAgICAgICAgICAgdmFyICR3b25zQ29udGFpbmVyID0gJHRoaXMuZmluZCgnLndvbnMnKTtcbiAgICAgICAgICAgIHZhciBpc0NvcnJlY3RlZCA9IChlLmJ1dHRvbiA9PT0gMikgfHwgZmFsc2U7IC8vINCV0YHQu9C4INC90LDQttCw0YLQsCDQv9GA0LDQstCw0Y8g0LrQvdC+0L/QutCwINC80YvRiNC4XG4gICAgICAgICAgICB2YXIgaXNOZXh0U2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcG9pbnQgPSAwO1xuICAgICAgICAgICAgdmFyIG9wcG9uZW50UG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyDQnNCw0L3QuNC/0YPQu9GP0YbQuNC4INC/0YDQuCDQv9C+0LHQtdC00LUg0LIg0YHQtdGC0LVcbiAgICAgICAgICAgIHZhciBwbGF5ZXJXaW5TZXQgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gXCJwbGF5ZXJcIiArIHBsYXllcjtcbiAgICAgICAgICAgICAgICBwb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgb3Bwb25lbnRQb2ludCA9IDA7XG4gICAgICAgICAgICAgICAgY3VycmVudFNldCsrO1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmVbaW5kZXhdLnNjb3JlICs9IDE7XG4gICAgICAgICAgICAgICAgJHdvbnNDb250YWluZXIuaHRtbCh0b3RhbFNjb3JlW2luZGV4XS5zY29yZSkuYWRkQ2xhc3MoJ2FuaW1hdGVkIGJvdW5jZUluJyk7XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIGlmICh0b3RhbFNjb3JlLnBvaW50cy5sZW5ndGggPCBjdXJyZW50U2V0ICsgMSkge1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzLnB1c2goezE6IDAsIDI6IDB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9IHBhcnNlSW50KHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0pO1xuXG4gICAgICAgICAgICBpZiAoaXNDb3JyZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdIC09IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPCAwKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9IDBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g0JXRgdC70Lgg0LHRi9C70L4g0LHQvtC70YzRiNC1LdC80LXQvdGM0YjQtSwg0Lgg0LDQtNC80LjQvSDRgdC60L7RgNGA0LXQutGC0LjRgNC+0LLQsNC7INGB0YfQtdGCIFwi0LzQtdC90YzRiNC1XCIg0L3QsNC30LDQtCwg0YLQviDQv9C+0LHQtdC00LAgXCLQsdC+0LvRjNGI0LVcIlxuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdGVkICYmIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW29wcG9uZW50XSA+PSAxMCAmJiB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0gLSB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdID4gMSkge1xuICAgICAgICAgICAgICAgIHBsYXllcldpblNldChvcHBvbmVudCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPj0gMTAgJiYgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA9PSB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0pIHtcbiAgICAgICAgICAgICAgICBwb2ludCA9IFwiPVwiO1xuICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSBcIj1cIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA+PSAxMSkge1xuICAgICAgICAgICAgICAgIGlmICh0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdIC0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bb3Bwb25lbnRdID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSAtIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW29wcG9uZW50XSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcldpblNldChwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQgPSBcIj5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSBcIjxcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzTmV4dFNldCkge1xuICAgICAgICAgICAgICAgIHBvaW50ID0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvdW50Q29udGFpbmVyLmh0bWwocG9pbnQpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgaWYgKG9wcG9uZW50UG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAkb3Bwb25lbnRDb250YWluZXIuaHRtbChvcHBvbmVudFBvaW50KS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9UT0RPOiBTYXZlIGRhdGFcbiAgICAgICAgICAgIF8udGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2F2ZUdhbWUoaWQsIHRvdGFsU2NvcmUpO1xuICAgICAgICAgICAgfSwgMTAwKSgpO1xuXG4gICAgICAgICAgICBjaGVja01hdGNoV2luKHRvdGFsU2NvcmUpO1xuXG4gICAgICAgICAgICAvKiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgdmFyICRjb3VudCA9ICR0aGlzLnBhcmVudHMoJy5yb3cnKS5maW5kKCcuY291bnQnKTtcbiAgICAgICAgICAgICB2YXIgcGxheWVyID0gJHRoaXMuZGF0YSgncGxheWVyJyk7XG4gICAgICAgICAgICAgdmFyIGluZGV4ID0gXCJwbGF5ZXJcIiArIHBsYXllcjtcbiAgICAgICAgICAgICB2YXIgY3VycmVudCA9IGN1cnJlbnRzW2luZGV4XTtcbiAgICAgICAgICAgICB2YXIgd29uID0gd29uc1tpbmRleF07XG5cbiAgICAgICAgICAgICBpZiAoIW1vcmVsZXNzKSB7XG4gICAgICAgICAgICAgLy8g0LXRgdC70Lgg0L/RgNCw0LLQsNGPINC60L3QvtC/0LrQsCDQvNGL0YjQuFxuICAgICAgICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMikge1xuICAgICAgICAgICAgIGN1cnJlbnQgLT0gMTtcbiAgICAgICAgICAgICBpZiAoY3VycmVudCA8IDApIHtcbiAgICAgICAgICAgICBjdXJyZW50ID0gMDtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgJHRoaXMuZmluZCgnLmNvdW50JykuaHRtbChjdXJyZW50KTtcbiAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIGN1cnJlbnQgKz0gMTtcbiAgICAgICAgICAgICAkdGhpcy5maW5kKCcuY291bnQnKS5odG1sKGN1cnJlbnQpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIC8vINC10YHQu9C4INC/0L4gMTAg0YMg0L7QsdC+0LjRhSwg0YLQviDQuNCz0YDQsCAtIFwi0LHQvtC70YzRiNC1LdC80LXQvdGM0YjQtVwiXG4gICAgICAgICAgICAgaWYgKCRjb3VudC5lcSgwKS5odG1sKCkgPT09ICcxMCcgJiYgJGNvdW50LmVxKDEpLmh0bWwoKSA9PT0gJzEwJykge1xuICAgICAgICAgICAgICRjb3VudC5odG1sKCc9Jyk7XG4gICAgICAgICAgICAgbW9yZWxlc3MgPSB0cnVlO1xuICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIC8vINC10YHQu9C4INC00L7RgdGC0LjQsyAxMSAtINCy0YvQuNCz0YDQsNC7XG4gICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IDExKSB7XG4gICAgICAgICAgICAgd29uICs9IDE7XG5cbiAgICAgICAgICAgICAkdGhpcy5maW5kKCcud29ucycpLmh0bWwod29uKS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICAkY291bnQuaHRtbCgnMCcpO1xuXG4gICAgICAgICAgICAgLy8g0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdGL0Lkg0LLRi9C40LPRgNGL0YggKNC40LPRgNC+0LrQuCDQvtGC0YvQs9GA0LDQu9C4KVxuICAgICAgICAgICAgIGlmICh3b24gPT09IDMpIHtcbiAgICAgICAgICAgICAkdGhpcy5wYXJlbnRzKCcucm93JykuZmluZCgnLmNvdW50JykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgc2VsZi5uZXh0R2FtZSgkdGhpcy5wYXJlbnRzKCcucm93JykuaW5kZXgoKSArIDEpO1xuICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICBjdXJyZW50c1tpbmRleF0gPSBjdXJyZW50ID09IDExID8gMCA6IGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICB3b25zW2luZGV4XSA9IHdvbjtcblxuICAgICAgICAgICAgIHZhciBkYXRhVG9TYXZlID0ge1xuICAgICAgICAgICAgIGlkOiAkKCcjZ2FtZUlkJykudmFsKCksXG4gICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgc2NvcmU6IHdvbnNbaW5kZXhdLCAvLyDRgdGH0LXRgiDQv9C+INGB0LXRgtCw0LxcbiAgICAgICAgICAgICBwb2ludDogY3VycmVudHNbaW5kZXhdIC8vINGB0YfQtdGCINCyINGC0LXQutGD0YnQtdC5INC/0LDRgNGC0LjQuFxuICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICBfLnRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICBzZWxmLnNhdmVHYW1lKGlkLCBkYXRhVG9TYXZlKTtcbiAgICAgICAgICAgICB9LCAxMDApKCk7XG5cblxuICAgICAgICAgICAgIGlmIChjdXJyZW50ID09IDExKSB7XG4gICAgICAgICAgICAgY3VycmVudHMgPSB7XG4gICAgICAgICAgICAgcGxheWVyMTogMCxcbiAgICAgICAgICAgICBwbGF5ZXIyOiAwXG4gICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIC8vINC40LPRgNCwIFwi0LHQvtC70YzRiNC1LdC80LXQvdGM0YjQtVwiXG4gICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgLy8g0LXRgdC70Lgg0LHRi9C70L4g0L/QvtGA0L7QstC90YMsINGC0L4g0YHRgtCw0LLQuNC8INC90YPQttC90L7QvNGDINC40LPRgNC+0LrRgyBcItCx0L7Qu9GM0YjQtVwiXG4gICAgICAgICAgICAgaWYgKCR0aGlzLmZpbmQoJy5jb3VudCcpLmh0bWwoKSA9PT0gJz0nKSB7XG4gICAgICAgICAgICAgJGNvdW50Lmh0bWwoJy0nKS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICAkdGhpcy5maW5kKCcuY291bnQnKS5odG1sKCcrJyk7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIC8vINC10YHQu9C4INCx0YvQuyAwLCDRgtC+INGD0YDQsNCy0L3QuNCy0LDQtdC8INC40LPRgNC+0LrQvtCyXG4gICAgICAgICAgICAgZWxzZSBpZiAoJHRoaXMuZmluZCgnLmNvdW50JykuaHRtbCgpID09PSAnLScpIHtcbiAgICAgICAgICAgICAkY291bnQuaHRtbCgnPScpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAvLyDQtdGB0LvQuCDQsdGL0LvQviBcItCx0L7Qu9GM0YjQtVwiLCDRgtC+INC40LPRgNC+0Log0LLRi9C40LPRgNGL0LLQsNC10YJcbiAgICAgICAgICAgICBlbHNlIGlmICgkdGhpcy5maW5kKCcuY291bnQnKS5odG1sKCkgPT09ICcrJykge1xuICAgICAgICAgICAgIHdvbiA9IHBhcnNlSW50KCR0aGlzLmZpbmQoJy53b25zJykuaHRtbCgpKTtcbiAgICAgICAgICAgICAkdGhpcy5maW5kKCcud29ucycpLmh0bWwoKyt3b24pO1xuICAgICAgICAgICAgIG1vcmVsZXNzID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAvLyDQvtC60L7QvdGH0LDRgtC10LvRjNC90YvQuSDQstGL0LjQs9GA0YvRiCAo0LjQs9GA0L7QutC4INC+0YLRi9Cz0YDQsNC70LgpXG4gICAgICAgICAgICAgaWYgKHdvbiA9PT0gMykge1xuICAgICAgICAgICAgICR0aGlzLnBhcmVudHMoJy5yb3cnKS5maW5kKCcuY291bnQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICBzZWxmLm5leHRHYW1lKCR0aGlzLnBhcmVudHMoJy5yb3cnKS5pbmRleCgpICsgMSk7XG4gICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIC8vINCy0YvQuNCz0YDRi9GIINCyINC40LPRgNC1ICjQv9GA0L7QtNC+0LvQttCw0LXQvClcbiAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAkY291bnQuaHRtbCgnMCcpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgJCgnLmNvdW50LCAud29ucycpLnJlbW92ZUNsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgIH0sIDUwMCk7Ki9cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBuZXh0R2FtZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHZhciAkZ2FtZSA9ICQoJ21haW4uY29udGVudCAucm93Jyk7XG4gICAgICAgICRnYW1lLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgJGdhbWUuZXEoaW5kZXgpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICB9LFxuICAgIHNhdmVHYW1lOiBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcbiAgICAgICAgaWYgKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogJy9nYW1lLycgKyBpZCArICcvc2F2ZScsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXMuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBhbGVydCgn0J7RiNC40LHQutCwINGB0L7RhdGA0LDQvdC10L3QuNGPJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ9Ch0L7RhdGA0LDQvdC10L3QvicsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59O1xuXG5HYW1lLmluaXQoKTtcbiJdfQ==
