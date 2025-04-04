$(document).ready(async function() {
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"
    var toggle_d_day_status = true;
    // 현재날짜 저장
    var currentDate = new Date();

    // DB에 있는 모든 데이터 저장
    var all_DB
    await axios.get('api/v1/calendar_list/')
        .then(res => {
            all_DB = res.data
        })
    
    // calendar 만드는 함수
    async function generateCalendar(d) {
        // currentDate는 값이 바뀔 수 있기 떄문에 따로 현재 날짜 저장
        var todayDate = new Date()
        // 날짜를 0000-00-00 형식으로 저장
        var string_today
        if (todayDate.getMonth() + 1 < 10) {
            if (todayDate.getDate() < 10) {
                string_today = todayDate.getFullYear() + '-' + '0' + '' + (todayDate.getMonth()+1) + '-' + '0' + todayDate.getDate()
            } else {
                string_today = todayDate.getFullYear() + '-' + '0' + '' + (todayDate.getMonth()+1) + '-' + todayDate.getDate()
            }
        } else {
            if (todayDate.getDate() < 10) {
                string_today = todayDate.getFullYear() + '-' + (todayDate.getMonth()+1) + '-' + '0' + todayDate.getDate()
            } else {
                string_today = todayDate.getFullYear() + "-" + (todayDate.getMonth()+1) + "-" + todayDate.getDate()
            }
        }
        
        // 날짜 계산 함수
        Date.prototype.monthDays = function() {
            var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
            return d.getDate();
        };
        // 계산하기 편하게 요번달 말 날짜, 요일, 달을 딕셔너리에 저장
        var details = {
            totalDays: d.monthDays(),
            weekDays: ['일', '월', '화', '수', '목', '금', '토'],
            months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        };

        // 달이 시작하는 요일
        var start = new Date(d.getFullYear(), d.getMonth()).getDay();
        // 이번 달에 이전 달 뒷부분 날짜를 달기위한 날짜 계산
        var copycurrent1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var copycurrent2 = new Date(currentDate.getFullYear(), currentDate.getMonth()+1);
        var restday = copycurrent1.getDate() - copycurrent1.getDay()
        // 달력을 만들기 위한 변수 cal은 html, day는 날짜, cnt는 다음달 날짜, date_list는 달력에 있는 날짜 리스트
        var cal = [];
        var day = 1;
        var cnt = 1;
        var date_list = []
        // 달력 만드는 for문
        for (var i = 0; i <= 6; i++) {
            // i == 0일때 달력 요일을 달고, 아닐때 날짜 달기
            if (i == 0) {
                cal.push(['<div class="week-day">']);
            } else {
                cal.push(['<div class="week">']);
            }
            for (var j = 0; j < 7; j++) {
                if (i === 0) {
                    cal[i].push('<div class="day-name">' + details.weekDays[j] + '</div>');
                } else if (day > details.totalDays) {
                    date_list.push(copycurrent2.getMonth()+1 + '-' + '0' + cnt + '-' + copycurrent2.getFullYear())
                    cal[i].push(`<div class="day"><h3 id="${copycurrent2.getMonth()+1 + '-' + '0' + cnt + '-' + copycurrent2.getFullYear()}" class="day-label">` + cnt++ + '</h3></div>');
                } else {
                    if (i === 1 && j < start) {
                        if (copycurrent1.getMonth()+1 < 10) {
                            date_list.push('0' + '' + (copycurrent1.getMonth()+1) + '-' + restday + '-' + copycurrent1.getFullYear())
                            cal[i].push(`<div class="day"><h3 id="${'0' + '' + (copycurrent1.getMonth()+1) + '-' + restday + '-' + copycurrent1.getFullYear()}" class="day-label">` + restday++ + '</h3></div>');
                        } else {
                            date_list.push(copycurrent1.getMonth()+1 + '-' + restday + '-' + copycurrent1.getFullYear())
                            cal[i].push(`<div class="day"><h3 id="${copycurrent1.getMonth()+1 + '-' + restday + '-' + copycurrent1.getFullYear()}" class="day-label">` + restday++ + '</h3></div>');
                        }
                    } else {
                        if (d.getMonth()+1 < 10) {
                            if (day < 10) {
                                date_list.push('0' + '' + (d.getMonth()+1) + '-' + '0' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${'0' + '' + (d.getMonth()+1) + '-' + '0' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            } else {
                                date_list.push('0' + '' + (d.getMonth()+1) + '-' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${'0' + '' + (d.getMonth()+1) + '-' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            }
                        } else {
                            if (day < 10) {
                                date_list.push(d.getMonth()+1 + '-' + '0' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${d.getMonth()+1 + '-' + '0' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            } else {
                                date_list.push(d.getMonth()+1 + '-' + day + '-' + d.getFullYear())
                                cal[i].push(`<div class="day"><h3 id="${d.getMonth()+1 + '-' + day + '-' + d.getFullYear()}" class="day-label">` + day++ + '</h3></div>');
                            }
                        }
                    }
                }
            }
            
            cal[i].push('</div>');

            if (day > details.totalDays) {
                break;
            }
        }
        // 배열형태 cal를 string형태로 변환
        cal = cal.reduce(function(a, b) {
            return a.concat(b); 
        }, []).join('');
        // 일정 데이터를 딕셔너리 형태로 저장, 키는 해당날짜 0000-00-00 
        var d_startdate = {}
        await all_DB.forEach(res => {
            const s_day_0 = res.start_day.split('-')
            const s_day = date_list[0].split('-')
            const e_day_0 = res.end_day.split('-')
            const e_day = date_list[date_list.length - 1].split('-')
            // 연속일정인지 단일일정인지 판단
            var judge = (res.start_day === res.end_day) ? false : true;
            // 각각 해당 날짜 저장
            const diff_d0 = new Date(s_day_0[2], s_day_0[0]-1, s_day_0[1])
            const diff_d1 = new Date(s_day[2], s_day[0]-1, s_day[1])
            const diff_d2 = new Date(e_day_0[2], e_day_0[0]-1, e_day_0[1])
            const diff_d3 = new Date(e_day[2], e_day[0]-1, Number(e_day[1])+1)
            
            const diff = Math.floor((diff_d2.getTime() - diff_d0.getTime()) / 1000 / 60 / 60 / 24)
            const diff_v = Math.floor((diff_d2.getTime() - diff_d1.getTime()) / 1000 / 60 / 60 / 24)

            // Compute summary
            var totalSubtasks = res.subtasks ? res.subtasks.length : 0;
            var completedSubtasks = 0;
            if (res.subtasks) {
                completedSubtasks = res.subtasks.filter(function(st) { return st.completed; }).length;
            }
            var summary = " (" + completedSubtasks + "/" + totalSubtasks + ") ";
            var d_day_str = 'D-' + (diff > 0 ? diff : 'Day');
            var end_date_month = ''
            var end_date_day = ''
            if (isNotEmpty(e_day_0[0])){
                var end_date_month = e_day_0[0].replace(/^0+/, '');
            } else {
                end_date_month = '*'
            }
            
            if (isNotEmpty(e_day_0[0])){
                var end_date_day = e_day_0[1].replace(/^0+/, '');
            } else {
                end_date_day = '*'
            }

            console.log('type: ', e_day_0[1], typeof end_date_day);
            var end_date_str = end_date_month + "월 " + end_date_day + "일";
            var toggle_str = toggle_d_day_status ? d_day_str : end_date_str;
            var titleWithSummary = res.title + summary +  toggle_str;


            // DB에 있는 모든 일정 저장 (include color at the end)
            if (res.start_day in d_startdate) {
                d_startdate[res.start_day].push([
                    diff+1, 
                    titleWithSummary, 
                    diff_d0.getDay(), 
                    false, 
                    `${diff_d0.getFullYear()}년 ${diff_d0.getMonth()+1}월 ${diff_d0.getDate()}일`, 
                    `${diff_d2.getFullYear()}년 ${diff_d2.getMonth()+1}월 ${diff_d2.getDate()}일`, 
                    res.start_time, 
                    res.end_time, 
                    res.content, 
                    judge, 
                    res.id,
                    res.color
                ]);
            } else {
                d_startdate[res.start_day] = [[
                    diff+1, 
                    titleWithSummary, 
                    diff_d0.getDay(), 
                    false, 
                    `${diff_d0.getFullYear()}년 ${diff_d0.getMonth()+1}월 ${diff_d0.getDate()}일`, 
                    `${diff_d2.getFullYear()}년 ${diff_d2.getMonth()+1}월 ${diff_d2.getDate()}일`, 
                    res.start_time, 
                    res.end_time, 
                    res.content, 
                    judge, 
                    res.id,
                    res.color
                ]];
            }

            // date_list에 시작날짜가 없어서 따로 저장하여 달력에 띄우기 위한 작업
            if (!date_list.includes(res.start_day) && date_list.includes(res.end_day)) {
                if (date_list[0] in d_startdate) {
                    d_startdate[date_list[0]].push([diff_v+1, res.title, diff_d1.getDay(), true, `${diff_d0.getFullYear() + '년' + ' ' + (diff_d0.getMonth()+1) + '월' + ' ' + diff_d0.getDate() + '일'}`, `${diff_d2.getFullYear() + '년' + ' ' + (diff_d2.getMonth()+1) + '월' + ' ' + diff_d2.getDate() + '일'}`, res.start_time, res.end_time, res.content, true, res.id, res.color])
                } else {
                    d_startdate[date_list[0]] = [[diff_v+1, res.title, diff_d1.getDay(), true, `${diff_d0.getFullYear() + '년' + ' ' + (diff_d0.getMonth()+1) + '월' + ' ' + diff_d0.getDate() + '일'}`, `${diff_d2.getFullYear() + '년' + ' ' + (diff_d2.getMonth()+1) + '월' + ' ' + diff_d2.getDate() + '일'}`, res.start_time, res.end_time, res.content, true, res.id, res.color]]
                }
            } else if (diff_d0 < diff_d1 && diff_d3 < diff_d2 ) {
                if (date_list[0] in d_startdate) {
                    d_startdate[date_list[0]].push([36, res.title, diff_d1.getDay(), true, `${diff_d0.getFullYear() + '년' + ' ' + (diff_d0.getMonth()+1) + '월' + ' ' + diff_d0.getDate() + '일'}`, `${diff_d2.getFullYear() + '년' + ' ' + (diff_d2.getMonth()+1) + '월' + ' ' + diff_d2.getDate() + '일'}`, res.start_time, res.end_time, res.content, true, res.id, res.color])
                } else {
                    d_startdate[date_list[0]] = [[36, res.title, diff_d1.getDay(), true, `${diff_d0.getFullYear() + '년' + ' ' + (diff_d0.getMonth()+1) + '월' + ' ' + diff_d0.getDate() + '일'}`, `${diff_d2.getFullYear() + '년' + ' ' + (diff_d2.getMonth()+1) + '월' + ' ' + diff_d2.getDate() + '일'}`, res.start_time, res.end_time, res.content, true, res.id, res.color]]
                }
            }

        })
        // html에 띄우는 작업
        $('#div-list').append(cal);
        $('#months').text(details.months[d.getMonth()]);
        $('#year').text(d.getFullYear());
        $('td.day').mouseover(function() {
            $(this).addClass('hover');
        }).mouseout(function() {
            $(this).removeClass('hover');
        });
        //일 일정 생성
        generateDaily(d)
        // date_content 값 생성 및 일정 html 달력에 추가작업
        var day_cal = ['7', '6', '5', '4', '3', '2', '1']
        for (var i in date_list) {
            if (date_list[i] in d_startdate) {
                d_startdate[date_list[i]].forEach(res => {
                    var data_content_consecutive = `'<div class="content-line">
                                                        <div class="event-consecutive-marking">
                                                        </div>
                                                        <div class="title">
                                                            <h5>${res[1]}</h5>
                                                            <h6 class="reservation">
                                                                ${res[4] + " " + "~" + " " + res[5]}
                                                            </h6>
                                                            <span class="reservation-time">
                                                                ⋅${res[6] + "~" + res[7]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="content-line">
                                                        <i class="material-icons">
                                                            notes
                                                        </i>
                                                        <div class="title">
                                                            <h6 class="reservation">
                                                                ${res[8]}
                                                            </h6>
                                                        </div>
                                                        <hr>
                                                        <button type="button" class="btn btn-danger delete">삭제</button>
                                                    </div>'`
                    var data_content = `'<div class="content-line">
                                            <div class="event-marking">
                                            </div>
                                            <div class="title">
                                                <h5>${res[1]}</h5>
                                                <h6 class="reservation">
                                                    ${res[4] + " " + "~" + " " + res[5]}
                                                </h6>
                                                <span class="reservation-time">
                                                    ⋅${res[6] + "~" + res[7]}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="content-line">
                                            <i class="material-icons">
                                                notes
                                            </i>
                                            <div class="title">
                                                <h6 class="reservation">
                                                    ${res[8]}
                                                </h6>
                                            </div>
                                        </div>'`
                    if (Number(res[0]) > Number(day_cal[res[2]])) {
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-toggle="popover" data-html="true" data-content=${data_content_consecutive}>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-toggle="popover" data-html="true" data-content=${data_content_consecutive}>${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-toggle="popover" data-html="true" data-content=${data_content}>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start" style="background-color: ${res[11]}; color:#fff;" data-span="${day_cal[res[2]]}" data-toggle="popover" data-html="true" data-content=${data_content}>${res[1]}</div>`);
                            }
                        }

                        var share = date_list[i].split('-')
                        var new_date = new Date(share[2], share[0]-1, Number(share[1]) + Number(day_cal[res[2]]))
                        if (new_date.getMonth() + 1 < 10) {
                            if (new_date.getDate() < 10) {
                                var s_new_date = '0' + '' + (new_date.getMonth() + 1) + '-' + '0' + new_date.getDate() + '-' + new_date.getFullYear()
                            } else {
                                var s_new_date = '0' + '' + (new_date.getMonth() + 1) + '-' + new_date.getDate() + '-' + new_date.getFullYear()
                            }
                        } else {
                            if (new_date.getDate() < 10) {
                                var s_new_date = (new_date.getMonth() + 1) + '-' + '0' + new_date.getDate() + '-' + new_date.getFullYear()
                            } else {
                                var s_new_date = (new_date.getMonth() + 1) + '-' + new_date.getDate() + '-' + new_date.getFullYear()
                            }
    
                        }

                        if (s_new_date in d_startdate) {
                            d_startdate[s_new_date].push([Number(res[0]) - Number(day_cal[res[2]]), res[1], 0, true, res[4], res[5], res[6], res[7], res[8], res[9], res[11], res[11]])
                        } else {
                            d_startdate[s_new_date] = [[Number(res[0]) - Number(day_cal[res[2]]), res[1], 0, true, res[4], res[5], res[6], res[7], res[8], res[9], res[11], res[11]]]
                        }

                    } else {
                        if (res[9]) {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-toggle="popover" data-html="true" data-content=${data_content_consecutive}>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end event-consecutive" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-toggle="popover" data-html="true" data-content=${data_content_consecutive}>${res[1]}</div>`);
                            }
                        } else {
                            if (res[3]) {
                                $(`#${date_list[i]}`).after(`<div class="event event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-toggle="popover" data-html="true" data-content=${data_content}>${res[1]}</div>`);
                            } else {
                                $(`#${date_list[i]}`).after(`<div class="event event-start event-end" style="background-color: ${res[11]}; color:#fff;" data-span="${res[0]}" data-toggle="popover" data-html="true" data-content=${data_content}>${res[1]}</div>`);
                            }
                        }
                    }
                })
            }
        }

        // 일정 클릭시 팝업으로 일정 상세내용이 나옴
        $(function () {
            $('[data-toggle="popover"]').popover().on('inserted.bs.popover')
        });

        // 달력클릭시 일정작성 폼이 나옴
        $('.week, .daily-calendar').click(function(e) {
            var cutdate = e.target.id.replaceAll('-', '/')
            $('[name=start_day]').val(cutdate)
            $('#registerSchedule').modal('show');
        });

        // 팝업 2개 이상 나오는 것을 막음
        $(".event-consecutive, .event, .event-repeated").click(function(event) {
            event.stopPropagation();
        });
    }
    //월, 일 일정이 따로 있어 일 일정을 따로 함수 구현
    async function generateDaily(d) {  
        const weekDays = ['일', '월', '화', '수', '목', '금', '토']
        var today_schedule = `<div class="daily-calendar"><span class="day-name">${d.getDate() + '일' + ' ' + weekDays[d.getDay()] + '요일'}</span>`
        await all_DB.forEach(res => {
            const start_date = res.start_day.split('-')
            const end_date = res.end_day.split('-')
            
            const start_date_0 = new Date(start_date[2], start_date[0]-1, start_date[1])
            const end_date_0 = new Date(end_date[2], end_date[0]-1, end_date[1])
            const end_date_1 = new Date(end_date[2], end_date[0]-1, Number(end_date[1])+1)

            if (start_date_0 <= d && d < end_date_1) {
                if (res.start_day === res.end_day) {
                    today_schedule += `<div class="event event-start event-end" data-toggle="popover" data-html="true" data-placement="left" 
                    data-content='<div class="content-line">
                                    <div class="event-marking"></div>
                                    <div class="title">
                                        <h5>${res.title}</h5>
                                        <h6 class="reservation">${start_date_0.getFullYear() + '년' + ' ' + (start_date_0.getMonth()+1) + '월' + ' ' + start_date_0.getDate() + '일' + ' ' + '~' + ' ' + end_date_0.getFullYear() + '년' + ' ' + (end_date_0.getMonth()+1) + '월' + ' ' + end_date_0.getDate() + '일'}</h6>
                                    </div>
                                </div>
                                <div class="content-line">
                                <i class="material-icons">
                                    notes
                                </i>
                                <div class="title">
                                    <h6 class="reservation">
                                        ${res.content}
                                    </h6>
                                    </div>'>${res.title}
                                </div>`
                } else {
                    today_schedule += `<div class="event-consecutive event-start event-end" data-toggle="popover" data-html="true" data-placement="left" 
                    data-content='<div class="content-line">
                                    <div class="event-consecutive-marking"></div>
                                    <div class="title">
                                        <h5>${res.title}</h5>
                                        <h6 class="reservation">${start_date_0.getFullYear() + '년' + ' ' + (start_date_0.getMonth()+1) + '월' + ' ' + start_date_0.getDate() + '일' + ' ' + '~' + ' ' + end_date_0.getFullYear() + '년' + ' ' + (end_date_0.getMonth()+1) + '월' + ' ' + end_date_0.getDate() + '일'}</h6>
                                    </div>
                                </div>
                                <div class="content-line">
                                <i class="material-icons">
                                    notes
                                </i>
                                <div class="title">
                                    <h6 class="reservation">
                                        ${res.content}
                                    </h6>
                                    </div>'>${res.title}
                                </div>`
                }
            }
      
        })
        today_schedule += '</div>'
        $('#day').append(today_schedule);
    }

    // -- NEW MODAL ENHANCEMENTS --

    // Remove any previous binding for the create button
    $(document).off('click', '#create');

    var selectedColor = '#4285F4'; // default color

    // Delegated event: Add new subtask row when '+' is clicked
    $(document).on('click', '#addSubtask', function() {
        var newRow = $('<div class="subtask-item d-flex align-items-center mb-2">' +
                       '<input type="checkbox" class="subtask-check mr-2">' +
                       '<input type="text" class="subtask-text form-control" placeholder="세부 할 일">' +
                       '</div>');
        $('#subtasksContainer').append(newRow);
        updateSubtaskProgress();
    });

    // Function to update the subtask progress indicator
    function updateSubtaskProgress() {
        var total = $('#subtasksContainer .subtask-item').length;
        var completed = 0;
        $('#subtasksContainer .subtask-item').each(function() {
           if ($(this).find('.subtask-check').prop('checked')) {
               completed++;
           }
        });
        $('#completedCount').text(completed);
        $('#totalCount').text(total);
    }

    // Update progress when a subtask checkbox changes state
    $(document).on('change', '.subtask-check', function() {
        updateSubtaskProgress();
    });

    // Delegated event: Color selection - highlight and record the selected color
    $(document).on('click', '#colorSelector .color-circle', function() {
        console.log('Color clicked: ', $(this).data('color'));
        selectedColor = $(this).data('color');
        $('#colorSelector .color-circle').removeClass('selected');
        $(this).addClass('selected');
    });

    // Delegated event: Save button ("일정 만들기")
    $(document).on('click', '#create', async function() {
        const data = new FormData();
        data.append('title', $('#recipient-name').val());
        
        // Gather dynamic subtasks
        var subtasks = [];
        $('#subtasksContainer .subtask-item').each(function() {
            var completed = $(this).find('.subtask-check').prop('checked');
            var text = $(this).find('.subtask-text').val();
            subtasks.push({ completed: completed, text: text });
        });
        data.append('subtasks', JSON.stringify(subtasks));
        
        // Append tags and selected color
        data.append('tags', $('#todoTags').val());
        data.append('color', selectedColor);
        
        // Append date/time fields (make sure these IDs match your modal inputs)
        data.append('start_day', $('#start-day').val());
        data.append('end_day', $('#end-day').val());
        data.append('start_time', $('#start-time').val());
        data.append('end_time', $('#end-time').val());
        
        await axios.post('api/v1/calendar_create/', data);
        window.location.href = '/calendar';
    });

    // Delegated event: Delete button
    $(document).on('click', '#deleteSchedule', function() {
        if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
            // Implement deletion logic here if needed
            console.log('Deleting schedule...');
            $('#registerSchedule').modal('hide');
        }
    });

    // today클릭시 현재날짜로 이동
    $('#todaymove').click(function() {
        $('#div-list').text('');
        $('#day').text('');
        currentDate = new Date()
        generateCalendar(currentDate);
    });

    // 달, 일에 따라 날짜 이동
    $('#left').click(function() {
        $('#div-list').text('');
        $('#day').text('');
        if ($( '.nav-link' ).attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate()) - 1)
            generateCalendar(currentDate)
        }
    });

    $('#right').click(function(e) {
        $('#div-list').text('');
        $('#day').text('');
        if ($( '.nav-link' ).attr( 'aria-selected' ) === 'true') {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            generateCalendar(currentDate);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate()) + 1)
            generateCalendar(currentDate)
        }
    });
    // modal에 하루종일 클릭시 시간설정 막음
    $('#inlineCheckbox2').click(function() {
        if ($('#inlineCheckbox2').is(":checked")) {
            $('[name="start_time"]').attr("readonly", true);
            $('[name="end_time"]').attr("readonly", true);
        } else {
            $('[name="start_time"]').attr("readonly", false);
            $('[name="end_time"]').attr("readonly", false);
        }

    });
    generateCalendar(currentDate);

    // Toggle between d-day view and end date view when clicking the newly added button.
    $(document).on('click', '#toggleSummary', function() {
        toggle_d_day_status = !toggle_d_day_status;
        // Optionally update button text to reflect current mode
        $(this).text(toggle_d_day_status ? 'D-DAY' : '마감일');
        // Clear and re-generate the calendar (assuming currentDate is in scope)
        $('#div-list').html('');
        $('#day').html('');
        generateCalendar(currentDate);
    });
});

String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}


function isNotEmpty(str){
    
    if(typeof str == "undefined" || str == null || str == "")
        return false;
    else
        return true ;
}

function nvl(str, defaultStr){
    
    if(typeof str == "undefined" || str == null || str == "")
        str = defaultStr ;
    
    return str ;
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$(function () {
    $('#view li:first-child a').tab('show')
});

$(function () {
    $('#datetimepicker1').datetimepicker({
        format: 'L'
    });
    $('#datetimepicker3').datetimepicker({
        format: 'L'
    });
});

$(function () {
    $('#datetimepicker2').datetimepicker({
        format: 'LT'
    });
    $('#datetimepicker4').datetimepicker({
        format: 'LT'
    });
});