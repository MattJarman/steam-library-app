const COMPLETED_CATEGORY_NAME = 'completed';
const TOAST_TIMEOUT = 3000;

$('document').ready(function() {
    // Disable modal submit button
    $('#add-game-submit').prop('disabled', true);

    eventListeners();
});

function eventListeners() {
    // Modal listeners
    $('#add-game-button').click(function() {
        toggleActive($('#add-game-modal'));
    });

    $('#edit-backlog-button').click(function() {
        toggleBacklogEditing();
    });

    $('#cancel-edit-backlog-button').click(function() {
        toggleBacklogEditing();
    });

    $('#delete-backlog-button').click(function() {
        deleteGames();
    });

    $('.modal-background').click(function() {
        toggleActive($(this.parentElement));
    });

    $('.modal-close').click(function() {
        toggleActive($(this.parentElement));
    });

    $('#add-game-cancel').click(function() {
        toggleActive($('#add-game-modal'));
    });

    $('.delete-dropdown-item').click(function() {
        let game = $(this).closest('.game-column');
        deleteGames(game); // Delete parent
    });

    $('.mark-complete-dropdown-item').click(function() {
        let gameElement = $(this).closest('.column-container')[0];
        let from = gameElement.classList[1];
        let gameId = gameElement.lastChild.id;

        moveGame(from, COMPLETED_CATEGORY_NAME, gameId);
    });

    // Search input listeners
    $('#game-search-input').on('input', function() {
        if(this.value) {
            $('#search-results').show();
            debouncedSearch(this.value);
            return;
        }

        $('#search-results').hide();
    });

    $('#game-search-input').on('keyup', function(e) {
        if(e.keyCode === 13) {
            e.preventDefault;
            $(this).blur();
            return false;
        }  
    });

    $('#game-search-input').on('keydown', function(e) {
        if(e.keyCode === 13) {
            e.preventDefault;
            return false;
        }  
    });

    $('#search-results').on('click', 'li', function() {
        if($('#search-tags').find('span[appid=\'' + this.id + '\']').length > 0) {
            $('span[appid=\'' + this.id + '\']').remove();
            $(this).find('svg').toggle();
            $('#search-tags').trigger('contentChanged');
            return;
        } 

        if($(this).hasClass('search-results-item')) {
            var tag = '<span class=\'tag added-tag\' appid=\'' + this.id + '\'>'
                    + '<div class=\'tag-text\'>' + this.innerText + '</div>'
                    + '<input type=\'hidden\' name=\'game\' value=\'' + this.id + '\'>'
                    + '<button class=\'delete is-small\' type=\'button\'>'
                    + '</span>';
            $('#search-tags').append(tag);
            $('#search-tags').trigger('contentChanged');
            $(this).find('svg').toggle();
        }
    });

    $('#search-tags').on('click', '.delete', function() {
        $(this.parentElement).remove();
        var id = $(this.parentElement).attr('appid');
        $('#' + id).find('svg').toggle();
        $('#search-tags').trigger('contentChanged');
    });

    $(document).on('contentChanged', '#search-tags', function() {
        if($('#search-tags').is(':empty')) {
            $('#add-game-submit').prop('disabled', true);
        } else {
            $('#add-game-submit').prop('disabled', false);
        }   
    });
}

function toggleActive(item) {
    item.toggleClass('is-active');
}

function toggleBacklogEditing() {
    $('.delete-checkbox').toggleClass('hidden');
    $('#delete-backlog-button').toggleClass('hidden');
    $('#edit-backlog-button').toggleClass('hidden');
    $('#cancel-edit-backlog-button').toggleClass('hidden');
}

function deleteGames(element = null) {
    let toDelete = {
        backlog: [],
        completed: []
    };

    if(element) {
        let gameId = element.attr('id');
        let category = element.parent()[0].classList[1];

        toDelete[category].push(gameId); 

        $.ajax({
            url: '/backlog/remove-games',
            type: 'POST',
            data: { 'toDelete': toDelete },
            success: res => {
                let response = JSON.parse(res);
                let deleted = response.payload;

                deleteElements(deleted[category], true);
                showToast('Game Deleted');
            },
            error: (jqXHR, status, err) => {}
         });

         return;
    }

    $('.column-container').each(function(i, obj) {
        let checked = obj.childNodes[0].checked;
        if(checked) {
            let gameId = obj.childNodes[1].id;
            let category = obj.classList[1];

            toDelete[category].push(gameId);
        }
    });

    $.ajax({
       url: '/backlog/remove-games',
       type: 'POST',
       data: { toDelete: toDelete },
       success: res => {
           let response = JSON.parse(res);
           let deleted = response.payload;

           for(let key in deleted) {
               deleteElements(deleted[key], true);
           }

           showToast('Games Deleted');
           toggleBacklogEditing();
       },
       error: (jqXHR, status, err) => {}
    });
}

function deleteElements(elements, deleteParent = false) {
    for(let i = 0; i < elements.length; i++) {
        if(deleteParent) {
            $('#' + elements[i]).parent().remove();
            continue;
        }
        $('#' + elements[i]).parent().remove();
    }
}

function moveGame(from, to, game) {
    $.ajax({
        url: '/backlog/move-games',
        type: 'POST',
        data: { 
            from: from,
            to: to,
            game: game
        },
        success: res => {
            let response = JSON.parse(res);
            let data = response.payload;
            
            let from = data.from;
            let to = data.to;
            let gameId = data.game;

            let gameElement = $(`#${gameId}`);
            gameElement.parent().removeClass(`${from}`);
            gameElement.parent().addClass(`${to}`);
            gameElement.parent().appendTo($(`#${to}`));
            
            showToast('Moved to Completed');
        },
        error: (jqXHR, status, err) => {}
     });
}

function showToast(message) {
    let toast = $('#toast');
    let toastMsg = $('#toast-message');
    toastMsg.text(message);
    toast.addClass('show');

    setTimeout(() => {
        toast.removeClass('show');
    }, TOAST_TIMEOUT);
}

function search(name) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/api/search',
            type: 'GET',
            async: true,
            data: 'app=' + name,
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, status, err) {
                resolve(err);
            }
        });
    });
}

function debounce(func, wait, immediate) {
    var timeout; 
    return function() {
        var context = this,
            args = arguments;

            var callNow = immediate && !timeout;
            
            clearTimeout(timeout);

            timeout = setTimeout(function() {
                timeout = null;

                if(!immediate) {
                    func.apply(context, args);
                }
            }, wait);
        if(callNow) func.apply(context, args);
    }
}

var debouncedSearch = debounce(async function(arg) {
    var name = arg.trim();
    var games = await search(name);
    var addedGames = [];

    // Add all currently added games to array
    $('.added-tag').each(function(i) {
        addedGames.push($(this).attr('appid'));
    });

    $('#search-results').empty();
    if(games.length === 0) {
        $('#search-results').append('<li>No Games Found</li>');
        return;
    } else {
        games.forEach(game => {
            var li = '<li id=\'' + game._id + '\' class=\'search-results-item\'> <p class=\'item-name\'>' + game.name + '</p><i class=\'fas fa-check\' aria-hidden=\'true\' style=\'display: none;\'></i></li>';
            addedGames.forEach(id => {
                if(id == game._id)
                    li = '<li id=\'' + game._id + '\' class=\'search-results-item\'>' + game.name + '</p><i class=\'fas fa-check\'></i></li>';
            });
            $('#search-results').append(li);
        });
    }
}, 100);