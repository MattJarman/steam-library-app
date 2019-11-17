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

    $('#cancel-button').click(function() {
        toggleBacklogEditing();
    });

    $('#trash-button').click(function() {
        deleteFromBacklog();
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
    $('.edit').toggle();
    $('.trash').toggle();
    $('.cancel').toggle();
}

function deleteFromBacklog() {
    let toDelete = [];
    $('.column-container').each(function(i, obj) {
        let checked = obj.childNodes[0].checked;
        if(checked) {
            let gameId = obj.childNodes[1].id;
            toDelete.push(gameId);
        }
    });

    $.ajax({
       url: '/backlog/remove-games',
       type: 'POST',
       data: { toDelete: toDelete },
       success: function() {
           location.reload();
       },
       error: function(jqXHR, status, err) {}
    });
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