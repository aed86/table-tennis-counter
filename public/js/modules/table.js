"use strict";

var $ = require('jquery');

var Table = {
    init: function () {
        this.addPlayers();
    },
    addPlayers: function () {
        $('#add-players').on('click', function () {
            $.ajax({
                type: "POST",
                url: '/table/add',
                data: {
                    "player1": $('.add-player1').val(),
                    "player2": $('.add-player2').val()
                }
            });
        });
    }
}

module.exports = Table;
