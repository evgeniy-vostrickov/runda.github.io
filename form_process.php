<?
    $host = 'localhost';
    $user = 'root';
    $pass = '';
    $db_name = 'runda';
    $link = mysqli_connect($host, $user, $pass, $db_name);

    // Защита от XSS атак
    // strip_tags — Удаляет теги HTML и PHP из строки
    // htmlspecialchars — Преобразование специальных символов в объекты HTML
    // addslashes — Экранирует строку с помощью слешей

    $email = strip_tags($_POST['email']);
    $first_name = strip_tags($_POST['first_name']);
    $last_name = strip_tags($_POST['last_name']);
    $phone = strip_tags($_POST['phone']);
    $about_me = strip_tags($_POST['about_me']);
    
    function send_answer($status, $message) {
        // Формируем ответ в виде ассоциативного массива
        $responseData = array(
            'status' => $status,
            'message' => $message,
            'data' => null
        );

        // Устанавливаем заголовок для указания типа данных (JSON)
        header('Content-Type: application/json');

        // Отправляем ответ в формате JSON
        echo json_encode($responseData);
    }

    $request_body = file_get_contents('php://input');
    $dataBody = json_decode($request_body);

    if ($link) {
        if (isset($_POST['email'])) {
            // $query = sprintf("SELECT * FROM `members` WHERE email='%s'", mysqli_real_escape_string($link, $email));
            // $records = mysqli_query($link, $query);
            
            /* Подготавливаем утверждение на вставку строк */
            $stmt = mysqli_prepare($link, "SELECT * FROM `members` WHERE email=?");
    
            /* Связываем переменные с метками */
            mysqli_stmt_bind_param($stmt, "s", mysqli_real_escape_string($link, $email));
    
            /* Выполняем утверждение */
            mysqli_stmt_execute($stmt);
    
            $records = mysqli_stmt_get_result($stmt);
            
            if (mysqli_num_rows($records) > 0) {
                send_answer('error', "Произошла ошибка при добавлении данных: '{$email}' уже существует в списке заявок!");
            }
            else {
                // $query = sprintf("INSERT INTO `members` (`email`, `name`, `lastname`, `phone`) VALUES ('%s', '%s', '%s', '%s')", mysqli_real_escape_string($link, $email), mysqli_real_escape_string($link, $first_name), mysqli_real_escape_string($link, $last_name), mysqli_real_escape_string($link, $phone));
                // $results = mysqli_query($link, $query);
                
                $stmt = mysqli_prepare($link, "INSERT INTO `members` (`email`, `name`, `lastname`, `phone`) VALUES (?, ?, ?, ?)");
                mysqli_stmt_bind_param($stmt, "ssss", mysqli_real_escape_string($link, $email), mysqli_real_escape_string($link, $first_name), mysqli_real_escape_string($link, $last_name), mysqli_real_escape_string($link, $phone));
                $results = mysqli_stmt_execute($stmt);
    
                if ($results) {
                    send_answer('success', 'Данные успешно добавлены в бд');
                } else {
                    send_answer('error', "Произошла ошибка при добавлении данных: " . mysqli_error($link));
                }
            }
        }
    }
    else {
        send_answer('error', 'Не могу соединиться с БД. Код ошибки: ' . mysqli_connect_errno() . ', ошибка: ' . mysqli_connect_error());
    }
    
    // send_answer('success', 'Данные успешно добавлены в бд');
?>
