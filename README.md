# demo-exam-pg

HyperSnips для быстрой разработки (инструкция)


Этот файл — краткая инструкция по настройке и использованию расширения HyperSnips в VS Code. Помогает мгновенно вставлять заготовки кода по коротким словам.

1. Установка


    В VS Code: Ctrl+Shift+X → найти HyperSnips (автор dlemstra) → установить.


    Перезагрузить VS Code.


2. Создание сниппета
   

    Нажать Ctrl+Shift+P → HyperSnips: Open Snippets Directory.


    В открывшейся папке создать файл (расширение .hsnips):

        all.hsnips – для всех языков.

        html.hsnips, javascript.hsnips, css.hsnips – для конкретных языков.

 3. В файле написать сниппет в формате:
    snippet trigger "Описание" флаги
    текст для вставки
    $1 - место курсора после вставки
    endsnippet
   
