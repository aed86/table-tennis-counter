(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Game = {
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
    changeGameStatus: function() {

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
                alert('you Win');
                $.ajax({

                })
            }
        };

        checkMatchWin(totalScore);
        $('.block').on('mousedown', function (e) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvanMvZ2FtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIEdhbWUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuaWQgPSAkKCcjZ2FtZUlkJykudmFsKCk7XG4gICAgICAgIGlmIChzZWxmLmlkKSB7XG4gICAgICAgICAgICBzZWxmLmdldEdhbWVEYXRhKHNlbGYuaWQpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nYW1lRGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb3VudChyZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRHYW1lRGF0YTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICB1cmw6ICcvZ2FtZS8nICsgaWQgKyAnL2pzb24nXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBjaGFuZ2VHYW1lU3RhdHVzOiBmdW5jdGlvbigpIHtcblxuICAgIH0sXG4gICAgY291bnQ6IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGlkID0gc2VsZi5pZDtcblxuICAgICAgICAvLyDRg9Cx0LjRgNCw0LXQvCDQstGL0LfQvtCyINC60L7QvdGC0LXQutGB0YLQvdC+0LPQviDQvNC10L3RjiDQv9GA0Lgg0LrQu9C40LrQtVxuICAgICAgICBkb2N1bWVudC5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0b3RhbFNjb3JlID0ge1xuICAgICAgICAgICAgcGxheWVyMToge1xuICAgICAgICAgICAgICAgIHNjb3JlOiBnYW1lLnBsYXllcjEuc2NvcmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbGF5ZXIyOiB7XG4gICAgICAgICAgICAgICAgc2NvcmU6IGdhbWUucGxheWVyMi5zY29yZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvaW50czogZ2FtZS5wb2ludHMsXG4gICAgICAgICAgICBzdGF0dXM6IGdhbWUuc3RhdHVzXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGN1cnJlbnRTZXQgPSBwYXJzZUludCh0b3RhbFNjb3JlLnBsYXllcjEuc2NvcmUpICsgcGFyc2VJbnQodG90YWxTY29yZS5wbGF5ZXIyLnNjb3JlKTtcblxuICAgICAgICB2YXIgY2hlY2tNYXRjaFdpbiA9IGZ1bmN0aW9uICh0b3RhbFNjb3JlKSB7XG4gICAgICAgICAgICBpZiAodG90YWxTY29yZS5wbGF5ZXIxLnNjb3JlID09IDMgfHwgdG90YWxTY29yZS5wbGF5ZXIyLnNjb3JlID09IDMpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgneW91IFdpbicpO1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG5cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNoZWNrTWF0Y2hXaW4odG90YWxTY29yZSk7XG4gICAgICAgICQoJy5ibG9jaycpLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSAkdGhpcy5kYXRhKCdwbGF5ZXInKTtcbiAgICAgICAgICAgIHZhciBvcHBvbmVudCA9IHBsYXllciA9PSAxID8gMiA6IDE7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBcInBsYXllclwiICsgcGxheWVyO1xuICAgICAgICAgICAgdmFyICRjb3VudENvbnRhaW5lciA9ICR0aGlzLmZpbmQoJy5jb3VudCcpO1xuICAgICAgICAgICAgdmFyICRvcHBvbmVudENvbnRhaW5lciA9ICR0aGlzLnBhcmVudCgpLmZpbmQoJ1tkYXRhLXBsYXllcj1cIicgKyBvcHBvbmVudCArICdcIl0nKS5maW5kKCcuY291bnQnKTtcbiAgICAgICAgICAgIHZhciAkd29uc0NvbnRhaW5lciA9ICR0aGlzLmZpbmQoJy53b25zJyk7XG4gICAgICAgICAgICB2YXIgaXNDb3JyZWN0ZWQgPSAoZS5idXR0b24gPT09IDIpIHx8IGZhbHNlOyAvLyDQldGB0LvQuCDQvdCw0LbQsNGC0LAg0L/RgNCw0LLQsNGPINC60L3QvtC/0LrQsCDQvNGL0YjQuFxuICAgICAgICAgICAgdmFyIGlzTmV4dFNldCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHBvaW50ID0gMDtcbiAgICAgICAgICAgIHZhciBvcHBvbmVudFBvaW50ID0gbnVsbDtcblxuICAgICAgICAgICAgLy8g0JzQsNC90LjQv9GD0LvRj9GG0LjQuCDQv9GA0Lgg0L/QvtCx0LXQtNC1INCyINGB0LXRgtC1XG4gICAgICAgICAgICB2YXIgcGxheWVyV2luU2V0ID0gZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IFwicGxheWVyXCIgKyBwbGF5ZXI7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIG9wcG9uZW50UG9pbnQgPSAwO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXQrKztcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlW2luZGV4XS5zY29yZSArPSAxO1xuICAgICAgICAgICAgICAgICR3b25zQ29udGFpbmVyLmh0bWwodG90YWxTY29yZVtpbmRleF0uc2NvcmUpLmFkZENsYXNzKCdhbmltYXRlZCBib3VuY2VJbicpO1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICBpZiAodG90YWxTY29yZS5wb2ludHMubGVuZ3RoIDwgY3VycmVudFNldCArIDEpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlLnBvaW50cy5wdXNoKHsxOiAwLCAyOiAwfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPSBwYXJzZUludCh0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdKTtcblxuICAgICAgICAgICAgaWYgKGlzQ29ycmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSAtPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdIDwgMCkge1xuICAgICAgICAgICAgICAgIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPSAwXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vINCV0YHQu9C4INCx0YvQu9C+INCx0L7Qu9GM0YjQtS3QvNC10L3RjNGI0LUsINC4INCw0LTQvNC40L0g0YHQutC+0YDRgNC10LrRgtC40YDQvtCy0LDQuyDRgdGH0LXRgiBcItC80LXQvdGM0YjQtVwiINC90LDQt9Cw0LQsINGC0L4g0L/QvtCx0LXQtNCwIFwi0LHQvtC70YzRiNC1XCJcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3RlZCAmJiB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0gPj0gMTAgJiYgdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bb3Bwb25lbnRdIC0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSA+IDEpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJXaW5TZXQob3Bwb25lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtwbGF5ZXJdID49IDEwICYmIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPT0gdG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bb3Bwb25lbnRdKSB7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSBcIj1cIjtcbiAgICAgICAgICAgICAgICBvcHBvbmVudFBvaW50ID0gXCI9XCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gPj0gMTEpIHtcbiAgICAgICAgICAgICAgICBpZiAodG90YWxTY29yZS5wb2ludHNbY3VycmVudFNldF1bcGxheWVyXSAtIHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW29wcG9uZW50XSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl0gLSB0b3RhbFNjb3JlLnBvaW50c1tjdXJyZW50U2V0XVtvcHBvbmVudF0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJXaW5TZXQocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ID0gXCI+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHBvbmVudFBvaW50ID0gXCI8XCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc05leHRTZXQpIHtcbiAgICAgICAgICAgICAgICBwb2ludCA9IHRvdGFsU2NvcmUucG9pbnRzW2N1cnJlbnRTZXRdW3BsYXllcl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvaW50ID0gMDtcbiAgICAgICAgICAgICAgICBvcHBvbmVudFBvaW50ID0gMDtcbiAgICAgICAgICAgICAgICBjdXJyZW50U2V0Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb3VudENvbnRhaW5lci5odG1sKHBvaW50KS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgIGlmIChvcHBvbmVudFBvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgJG9wcG9uZW50Q29udGFpbmVyLmh0bWwob3Bwb25lbnRQb2ludCkuYWRkQ2xhc3MoJ2FuaW1hdGVkIGJvdW5jZUluJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vVE9ETzogU2F2ZSBkYXRhXG4gICAgICAgICAgICBfLnRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNhdmVHYW1lKGlkLCB0b3RhbFNjb3JlKTtcbiAgICAgICAgICAgIH0sIDEwMCkoKTtcblxuICAgICAgICAgICAgY2hlY2tNYXRjaFdpbih0b3RhbFNjb3JlKTtcblxuICAgICAgICAgICAgLyogICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgIHZhciAkY291bnQgPSAkdGhpcy5wYXJlbnRzKCcucm93JykuZmluZCgnLmNvdW50Jyk7XG4gICAgICAgICAgICAgdmFyIHBsYXllciA9ICR0aGlzLmRhdGEoJ3BsYXllcicpO1xuICAgICAgICAgICAgIHZhciBpbmRleCA9IFwicGxheWVyXCIgKyBwbGF5ZXI7XG4gICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBjdXJyZW50c1tpbmRleF07XG4gICAgICAgICAgICAgdmFyIHdvbiA9IHdvbnNbaW5kZXhdO1xuXG4gICAgICAgICAgICAgaWYgKCFtb3JlbGVzcykge1xuICAgICAgICAgICAgIC8vINC10YHQu9C4INC/0YDQsNCy0LDRjyDQutC90L7Qv9C60LAg0LzRi9GI0LhcbiAgICAgICAgICAgICBpZiAoZS5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgICBjdXJyZW50IC09IDE7XG4gICAgICAgICAgICAgaWYgKGN1cnJlbnQgPCAwKSB7XG4gICAgICAgICAgICAgY3VycmVudCA9IDA7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgICR0aGlzLmZpbmQoJy5jb3VudCcpLmh0bWwoY3VycmVudCk7XG4gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICBjdXJyZW50ICs9IDE7XG4gICAgICAgICAgICAgJHRoaXMuZmluZCgnLmNvdW50JykuaHRtbChjdXJyZW50KS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAvLyDQtdGB0LvQuCDQv9C+IDEwINGDINC+0LHQvtC40YUsINGC0L4g0LjQs9GA0LAgLSBcItCx0L7Qu9GM0YjQtS3QvNC10L3RjNGI0LVcIlxuICAgICAgICAgICAgIGlmICgkY291bnQuZXEoMCkuaHRtbCgpID09PSAnMTAnICYmICRjb3VudC5lcSgxKS5odG1sKCkgPT09ICcxMCcpIHtcbiAgICAgICAgICAgICAkY291bnQuaHRtbCgnPScpO1xuICAgICAgICAgICAgIG1vcmVsZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAvLyDQtdGB0LvQuCDQtNC+0YHRgtC40LMgMTEgLSDQstGL0LjQs9GA0LDQu1xuICAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSAxMSkge1xuICAgICAgICAgICAgIHdvbiArPSAxO1xuXG4gICAgICAgICAgICAgJHRoaXMuZmluZCgnLndvbnMnKS5odG1sKHdvbikuYWRkQ2xhc3MoJ2FuaW1hdGVkIGJvdW5jZUluJyk7XG4gICAgICAgICAgICAgJGNvdW50Lmh0bWwoJzAnKTtcblxuICAgICAgICAgICAgIC8vINC+0LrQvtC90YfQsNGC0LXQu9GM0L3Ri9C5INCy0YvQuNCz0YDRi9GIICjQuNCz0YDQvtC60Lgg0L7RgtGL0LPRgNCw0LvQuClcbiAgICAgICAgICAgICBpZiAod29uID09PSAzKSB7XG4gICAgICAgICAgICAgJHRoaXMucGFyZW50cygnLnJvdycpLmZpbmQoJy5jb3VudCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgIHNlbGYubmV4dEdhbWUoJHRoaXMucGFyZW50cygnLnJvdycpLmluZGV4KCkgKyAxKTtcbiAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgY3VycmVudHNbaW5kZXhdID0gY3VycmVudCA9PSAxMSA/IDAgOiBjdXJyZW50O1xuXG4gICAgICAgICAgICAgd29uc1tpbmRleF0gPSB3b247XG5cbiAgICAgICAgICAgICB2YXIgZGF0YVRvU2F2ZSA9IHtcbiAgICAgICAgICAgICBpZDogJCgnI2dhbWVJZCcpLnZhbCgpLFxuICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgIHNjb3JlOiB3b25zW2luZGV4XSwgLy8g0YHRh9C10YIg0L/QviDRgdC10YLQsNC8XG4gICAgICAgICAgICAgcG9pbnQ6IGN1cnJlbnRzW2luZGV4XSAvLyDRgdGH0LXRgiDQsiDRgtC10LrRg9GJ0LXQuSDQv9Cw0YDRgtC40LhcbiAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgXy50aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgc2VsZi5zYXZlR2FtZShpZCwgZGF0YVRvU2F2ZSk7XG4gICAgICAgICAgICAgfSwgMTAwKSgpO1xuXG5cbiAgICAgICAgICAgICBpZiAoY3VycmVudCA9PSAxMSkge1xuICAgICAgICAgICAgIGN1cnJlbnRzID0ge1xuICAgICAgICAgICAgIHBsYXllcjE6IDAsXG4gICAgICAgICAgICAgcGxheWVyMjogMFxuICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAvLyDQuNCz0YDQsCBcItCx0L7Qu9GM0YjQtS3QvNC10L3RjNGI0LVcIlxuICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgIC8vINC10YHQu9C4INCx0YvQu9C+INC/0L7RgNC+0LLQvdGDLCDRgtC+INGB0YLQsNCy0LjQvCDQvdGD0LbQvdC+0LzRgyDQuNCz0YDQvtC60YMgXCLQsdC+0LvRjNGI0LVcIlxuICAgICAgICAgICAgIGlmICgkdGhpcy5maW5kKCcuY291bnQnKS5odG1sKCkgPT09ICc9Jykge1xuICAgICAgICAgICAgICRjb3VudC5odG1sKCctJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGJvdW5jZUluJyk7XG4gICAgICAgICAgICAgJHRoaXMuZmluZCgnLmNvdW50JykuaHRtbCgnKycpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAvLyDQtdGB0LvQuCDQsdGL0LsgMCwg0YLQviDRg9GA0LDQstC90LjQstCw0LXQvCDQuNCz0YDQvtC60L7QslxuICAgICAgICAgICAgIGVsc2UgaWYgKCR0aGlzLmZpbmQoJy5jb3VudCcpLmh0bWwoKSA9PT0gJy0nKSB7XG4gICAgICAgICAgICAgJGNvdW50Lmh0bWwoJz0nKS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgLy8g0LXRgdC70Lgg0LHRi9C70L4gXCLQsdC+0LvRjNGI0LVcIiwg0YLQviDQuNCz0YDQvtC6INCy0YvQuNCz0YDRi9Cy0LDQtdGCXG4gICAgICAgICAgICAgZWxzZSBpZiAoJHRoaXMuZmluZCgnLmNvdW50JykuaHRtbCgpID09PSAnKycpIHtcbiAgICAgICAgICAgICB3b24gPSBwYXJzZUludCgkdGhpcy5maW5kKCcud29ucycpLmh0bWwoKSk7XG4gICAgICAgICAgICAgJHRoaXMuZmluZCgnLndvbnMnKS5odG1sKCsrd29uKTtcbiAgICAgICAgICAgICBtb3JlbGVzcyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgLy8g0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdGL0Lkg0LLRi9C40LPRgNGL0YggKNC40LPRgNC+0LrQuCDQvtGC0YvQs9GA0LDQu9C4KVxuICAgICAgICAgICAgIGlmICh3b24gPT09IDMpIHtcbiAgICAgICAgICAgICAkdGhpcy5wYXJlbnRzKCcucm93JykuZmluZCgnLmNvdW50JykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgc2VsZi5uZXh0R2FtZSgkdGhpcy5wYXJlbnRzKCcucm93JykuaW5kZXgoKSArIDEpO1xuICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAvLyDQstGL0LjQs9GA0YvRiCDQsiDQuNCz0YDQtSAo0L/RgNC+0LTQvtC70LbQsNC10LwpXG4gICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgJGNvdW50Lmh0bWwoJzAnKS5hZGRDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICQoJy5jb3VudCwgLndvbnMnKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgYm91bmNlSW4nKTtcbiAgICAgICAgICAgICB9LCA1MDApOyovXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgbmV4dEdhbWU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICB2YXIgJGdhbWUgPSAkKCdtYWluLmNvbnRlbnQgLnJvdycpO1xuICAgICAgICAkZ2FtZS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICRnYW1lLmVxKGluZGV4KS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgfSxcbiAgICBzYXZlR2FtZTogZnVuY3Rpb24gKGlkLCBkYXRhKSB7XG4gICAgICAgIGlmIChpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6ICcvZ2FtZS8nICsgaWQgKyAnL3NhdmUnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIGlmICghcmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ9Ce0YjQuNCx0LrQsCDRgdC+0YXRgNCw0L3QtdC90LjRjycpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfQodC+0YXRgNCw0L3QtdC90L4nLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufTtcblxuR2FtZS5pbml0KCk7XG4iXX0=
