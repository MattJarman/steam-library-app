$('document').ready(function() {
    // Disable modal submit button
    $('#add-game-submit').prop('disabled', true);

    eventListeners();
});


function eventListeners() {
    // Modal listeners
    $('#add-game-button').click(function() {
        $('#add-game-modal').toggleClass('is-active');
    });

    $('.modal-background').click(function() {
        $(this.parentElement).toggleClass('is-active');
    });

    $('.modal-close').click(function() {
        $(this.parentElement).toggleClass('is-active');
    });

    $('#add-game-cancel').click(function() {
        $('#add-game-modal').toggleClass('is-active');
    });

    // Search input listeners
    $('#game-search-input').on('input', function() {
        debouncedSearch(this.value);
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
        } else {
            if($(this).hasClass('search-results-item')) {
                var tag = '<span class=\'tag added-tag\' appid=\'' + this.id + '\'>'
                        + '<div class=\'tag-text\'>' + this.innerText + '</div>'
                        + '<input type=\'hidden\' name=\'game\' value=\'' + this.id + '\'>'
                        + '<button class=\'delete is-small\' type=\'button\'>'
                        + '</span>';
                $('#search-tags').append(tag);
            }
        }

        $('#search-tags').trigger('contentChanged');
        $(this).find('svg').toggle();
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