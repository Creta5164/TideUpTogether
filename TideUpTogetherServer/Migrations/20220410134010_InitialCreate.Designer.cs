﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TideUpTogetherServer;

#nullable disable

namespace TideUpTogetherServer.Migrations
{
    [DbContext(typeof(CommentDbContext))]
    [Migration("20220410134010_InitialCreate")]
    partial class InitialCreate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "6.0.3");

            modelBuilder.Entity("TideUpTogetherServer.CommentData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasColumnName("id");

                    b.Property<int>("AdverbId")
                        .HasColumnType("INTEGER")
                        .HasColumnName("adverb");

                    b.Property<int>("FirstBaseParagraph")
                        .HasColumnType("INTEGER")
                        .HasColumnName("fpara");

                    b.Property<int>("FirstWordId")
                        .HasColumnType("INTEGER")
                        .HasColumnName("fword");

                    b.Property<int>("FirstWordType")
                        .HasColumnType("INTEGER")
                        .HasColumnName("fword_type");

                    b.Property<int>("MapId")
                        .HasColumnType("INTEGER")
                        .HasColumnName("map");

                    b.Property<int>("SecondBaseParagraph")
                        .HasColumnType("INTEGER")
                        .HasColumnName("spara");

                    b.Property<int>("SecondWordId")
                        .HasColumnType("INTEGER")
                        .HasColumnName("sword");

                    b.Property<int>("SecondWordType")
                        .HasColumnType("INTEGER")
                        .HasColumnName("sword_type");

                    b.Property<int>("Type")
                        .HasColumnType("INTEGER")
                        .HasColumnName("type");

                    b.Property<float>("X")
                        .HasColumnType("REAL")
                        .HasColumnName("x");

                    b.Property<float>("Y")
                        .HasColumnType("REAL")
                        .HasColumnName("y");

                    b.HasKey("Id");

                    b.ToTable("comments");
                });
#pragma warning restore 612, 618
        }
    }
}
