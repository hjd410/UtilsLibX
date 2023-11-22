package com.hjd.test


interface DB {
    fun save()
}

class SqlDB() : DB {
    override fun save() = println("save sql")
}

class MySqlDB() : DB {
    override fun save() = println("save MySqlDB")
}

class OracleSqlDB() : DB {
    override fun save() = println("save OracleSqlDB")
}

class CreateDb(db: DB) : DB by db

fun main() {
    CreateDb(SqlDB()).save()
    CreateDb(MySqlDB()).save()
    CreateDb(OracleSqlDB()).save()
}

